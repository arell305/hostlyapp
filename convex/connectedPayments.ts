import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { requireAuthenticatedUser } from "../utils/auth";
import { Gender, ResponseStatus, UserRole } from "@/types/enums";
import { validateOrganization } from "./backendUtils/validation";
import { handleError, isUserInOrganization } from "./backendUtils/helper";
import { GetTotalRevenueByOrganizationResponse } from "@/types/convex-types";
import { startOfPstDay } from "@/utils/luxon";
import { formatToPstShortDate } from "@/utils/luxon";

export const insertConnectedPayment = internalMutation({
  args: {
    eventId: v.id("events"),
    stripePaymentIntentId: v.string(),
    email: v.string(),
    totalAmount: v.number(),
    promoCode: v.union(v.string(), v.null()),
    maleCount: v.number(),
    femaleCount: v.number(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<Id<"connectedPayments">> => {
    const {
      eventId,
      stripePaymentIntentId,
      email,
      totalAmount,
      promoCode,
      maleCount,
      femaleCount,
      organizationId,
    } = args;

    try {
      const paymentId: Id<"connectedPayments"> = await ctx.db.insert(
        "connectedPayments",
        {
          eventId,
          stripePaymentIntentId,
          email,
          totalAmount,
          promoCode,
          maleCount,
          femaleCount,
          organizationId,
        }
      );

      return paymentId;
    } catch (error) {
      console.error("Error inserting payment record:", error);
      throw new Error("Failed to insert payment record.");
    }
  },
});

export const getTotalRevenueByOrganization = query({
  args: {
    organizationId: v.id("organizations"),
    fromTimestamp: v.number(),
    toTimestamp: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetTotalRevenueByOrganizationResponse> => {
    const { organizationId, fromTimestamp, toTimestamp } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Admin,
      ]);

      const organization = validateOrganization(
        await ctx.db.get(organizationId)
      );
      isUserInOrganization(identity, organization.clerkOrganizationId);

      const payments = await ctx.db
        .query("connectedPayments")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", organizationId)
        )
        .collect();

      const prevFrom = fromTimestamp - (toTimestamp - fromTimestamp);
      const prevTo = fromTimestamp;

      const filterPayments = (
        entries: typeof payments,
        from: number,
        to: number
      ) =>
        entries.filter((p) => p._creationTime >= from && p._creationTime < to);

      const current = filterPayments(payments, fromTimestamp, toTimestamp);
      const previous = filterPayments(payments, prevFrom, prevTo);

      const getStats = (entries: typeof payments) => {
        const revenue = entries.reduce((sum, p) => sum + p.totalAmount, 0);
        const tickets = entries.reduce(
          (sum, p) => sum + p.maleCount + p.femaleCount,
          0
        );
        return { revenue, tickets };
      };

      const currentStats = getStats(current);
      const previousStats = getStats(previous);

      const msPerDay = 1000 * 60 * 60 * 24;
      const days = Math.max(
        1,
        Math.ceil((toTimestamp - fromTimestamp) / msPerDay)
      );

      const getChange = (curr: number, prev: number) => {
        if (prev === 0) return curr === 0 ? 0 : 100;
        return ((curr - prev) / prev) * 100;
      };

      const revenueMap: Record<string, number> = {};

      for (const p of current) {
        const dateStr = formatToPstShortDate(p._creationTime);
        if (!revenueMap[dateStr]) revenueMap[dateStr] = 0;
        revenueMap[dateStr] += p.totalAmount;
      }

      // Build the full list of days between from and to
      const revenueByDay: { date: string; revenue: number }[] = [];
      let day = startOfPstDay(fromTimestamp);

      const end = startOfPstDay(toTimestamp);
      while (day <= end) {
        const dateStr = day.toFormat("M/d/yy");
        revenueByDay.push({ date: dateStr, revenue: revenueMap[dateStr] || 0 });
        day = day.plus({ days: 1 });
      }

      // Group revenue by event name
      const revenueByEventMap: Record<string, number> = {};

      for (const payment of current) {
        const eventId = payment.eventId;
        if (!eventId) continue;

        const event = await ctx.db.get(eventId);
        if (!event) continue;

        const name = event.name;
        if (!revenueByEventMap[name]) revenueByEventMap[name] = 0;
        revenueByEventMap[name] += payment.totalAmount;
      }

      const revenueByEvent: { name: string; revenue: number }[] =
        Object.entries(revenueByEventMap).map(([name, revenue]) => ({
          name,
          revenue,
        }));

      const allTickets = await ctx.db
        .query("tickets")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", organizationId)
        )
        .collect();

      const filteredTickets = allTickets.filter(
        (t) =>
          t._creationTime >= fromTimestamp &&
          t._creationTime <= toTimestamp &&
          t.promoterUserId !== null
      );
      const promoterTicketMap: Record<
        string,
        { male: number; female: number }
      > = {};

      for (const ticket of filteredTickets) {
        const promoterId = ticket.promoterUserId!;
        if (!promoterTicketMap[promoterId]) {
          promoterTicketMap[promoterId] = { male: 0, female: 0 };
        }
        if (ticket.gender === Gender.Male) {
          promoterTicketMap[promoterId].male++;
        } else {
          promoterTicketMap[promoterId].female++;
        }
      }

      const promoterBreakdown = await Promise.all(
        Object.entries(promoterTicketMap).map(async ([promoterId, counts]) => {
          const promoter = await ctx.db.get(promoterId as Id<"users">);
          return {
            name: promoter?.name || "Unknown",
            male: counts.male,
            female: counts.female,
          };
        })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          totalRevenue: {
            value: currentStats.revenue,
            change: getChange(currentStats.revenue, previousStats.revenue),
          },
          averageDailyRevenue: {
            value: currentStats.revenue / days,
            change: getChange(
              currentStats.revenue / days,
              previousStats.revenue / days
            ),
          },
          totalTicketsSold: {
            value: currentStats.tickets,
            change: getChange(currentStats.tickets, previousStats.tickets),
          },
          averageDailyTicketsSold: {
            value: currentStats.tickets / days,
            change: getChange(
              currentStats.tickets / days,
              previousStats.tickets / days
            ),
          },
          revenueByDay,
          revenueByEvent,
          promoterBreakdown,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
