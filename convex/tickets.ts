import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { TicketCounts, TicketInput } from "@/types/types";
import { ErrorMessages, Gender, UserRole, ResponseStatus } from "@/types/enums";
import { Id } from "./_generated/dataModel";
import {
  CustomerTicket,
  TicketSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import {
  CheckInTicketResponse,
  GetPromoterTicketKpisResponse,
  GetTicketSalesByPromoterResponse,
  GetTicketsByClerkUserResponse,
  GetTicketsByEventIdResponse,
  InsertTicketSoldResponse,
} from "@/types/convex-types";
import { nanoid } from "nanoid";
import { api, internal } from "./_generated/api";
import { generatePDF } from "../utils/pdf";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateEvent,
  validateUser,
  validateTicket,
  validateTicketCheckIn,
} from "./backendUtils/validation";
import { handleError, isUserInCompanyOfEvent } from "./backendUtils/helper";
import { DateTime } from "luxon";
import { formatToPstShortDate } from "@/utils/luxon";
import { startOfPstDay } from "@/utils/luxon";

export const insertTicketsSold = action({
  args: {
    eventId: v.id("events"),
    promoCode: v.union(v.string(), v.null()),
    email: v.string(),
    maleCount: v.number(),
    femaleCount: v.number(),
  },
  handler: async (ctx, args): Promise<InsertTicketSoldResponse> => {
    const { eventId, promoCode, email, maleCount, femaleCount } = args;
    try {
      const { event, promoterUserId } = await ctx.runQuery(
        internal.events.getEventsWithTickets,
        {
          eventId,
          promoCode,
        }
      );

      const shortEventId = event._id.slice(0, 4);
      const tickets: CustomerTicket[] = [];

      const createCustomerTicket = (ticket: TicketSchema): CustomerTicket => ({
        ...ticket,
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        address: event.address,
      });

      for (let i = 0; i < maleCount; i++) {
        const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
        const ticketInput: TicketInput = {
          eventId,
          promoterUserId,
          email,
          gender: Gender.Male,
          ticketUniqueId,
        };
        const ticketId = await ctx.runMutation(internal.tickets.insertTicket, {
          ticketInput,
        });

        const ticket = await ctx.runQuery(internal.tickets.getTicketById, {
          ticketId,
        });
        if (ticket) tickets.push(createCustomerTicket(ticket));
      }

      for (let i = 0; i < femaleCount; i++) {
        const ticketUniqueId = `${shortEventId}_${nanoid(6)}`;
        const ticketInput: TicketInput = {
          eventId,
          promoterUserId,
          email,
          gender: Gender.Female,
          ticketUniqueId,
        };

        const ticketId = await ctx.runMutation(internal.tickets.insertTicket, {
          ticketInput,
        });

        const ticket = await ctx.runQuery(internal.tickets.getTicketById, {
          ticketId,
        });
        if (ticket) tickets.push(createCustomerTicket(ticket));
      }

      await ctx.runAction(api.pdfMonkey.generatePDF, {
        tickets,
        email,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          tickets,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getTicketsByEventId = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args): Promise<GetTicketsByEventIdResponse> => {
    const { eventId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Moderator,
        UserRole.Promoter,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .first()
      );

      const event = validateEvent(await ctx.db.get(eventId));

      isUserInCompanyOfEvent(user, event);

      let tickets: TicketSchema[];

      if (user.role === UserRole.Promoter) {
        tickets = await ctx.db
          .query("tickets")
          .withIndex("by_eventId_and_promoterUserId", (q) =>
            q.eq("eventId", eventId).eq("promoterUserId", user._id)
          )
          .collect();
      } else {
        tickets = await ctx.db
          .query("tickets")
          .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
          .collect();
      }

      const promoterIds = Array.from(
        new Set(
          tickets
            .map((ticket) => ticket.promoterUserId)
            .filter((id): id is Id<"users"> => id !== null)
        )
      );

      const allUsers = await ctx.db.query("users").collect();

      const promoterMap = allUsers.reduce(
        (acc, user) => {
          if (user._id && promoterIds.includes(user._id)) {
            acc[user._id] = user.name || null;
          }
          return acc;
        },
        {} as Record<string, string | null>
      );

      const ticketsWithPromoterName: TicketSchemaWithPromoter[] = tickets.map(
        (ticket) => ({
          ...ticket,
          promoterName: ticket.promoterUserId
            ? promoterMap[ticket.promoterUserId] || null
            : null,
        })
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: { tickets: ticketsWithPromoterName },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const checkInTicket = mutation({
  args: { ticketUniqueId: v.string() },
  handler: async (ctx, args): Promise<CheckInTicketResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Moderator,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .first()
      );

      const ticket = validateTicket(
        await ctx.db
          .query("tickets")
          .filter((q) => q.eq(q.field("ticketUniqueId"), args.ticketUniqueId))
          .first()
      );

      const event = validateEvent(
        await ctx.db
          .query("events")
          .filter((q) => q.eq(q.field("_id"), ticket.eventId))
          .first()
      );

      isUserInCompanyOfEvent(user, event);

      validateTicketCheckIn(ticket, event);

      await ctx.db.patch(ticket._id, {
        checkInTime: DateTime.now().toMillis(),
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: { ticketId: ticket._id },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const insertTicket = internalMutation({
  handler: async (
    ctx,
    { ticketInput }: { ticketInput: TicketInput }
  ): Promise<Id<"tickets">> => {
    try {
      const ticketId = await ctx.db.insert("tickets", ticketInput);

      return ticketId;
    } catch (error) {
      console.error("Error inserting ticket:", error);
      throw new Error(ErrorMessages.TICKET_INSERT);
    }
  },
});

export const getTicketById = internalQuery({
  handler: async (ctx, { ticketId }: { ticketId: Id<"tickets"> }) => {
    try {
      const ticket = await ctx.db.get(ticketId);
      if (!ticket) {
        throw new Error(ErrorMessages.TICKET_NOT_FOUND);
      }
      return ticket;
    } catch (error) {
      console.error("Error fetching ticket:", error);
      throw new Error(ErrorMessages.TICKET_DB_QUERY);
    }
  },
});

export const getTicketsByClerkUser = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetTicketsByClerkUserResponse> => {
    const { eventId } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [UserRole.Promoter]);
      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
          .first()
      );

      const event = validateEvent(await ctx.db.get(eventId));
      isUserInCompanyOfEvent(user, event);

      const tickets: TicketSchema[] = await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
        .collect();

      const ticketCounts: TicketCounts = tickets.reduce(
        (acc, ticket) => {
          if (ticket.gender === Gender.Male) {
            acc.male += 1;
          } else if (ticket.gender === Gender.Female) {
            acc.female += 1;
          }
          return acc;
        },
        { male: 0, female: 0 }
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: { ticketCounts },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getTicketsByEvent = internalQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }): Promise<TicketSchema[]> => {
    try {
      return await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
        .collect();
    } catch (error) {
      console.error("Error in getTicketsByEvent:", error);
      return [];
    }
  },
});

export const getPromoterTicketKpis = query({
  args: {
    fromTimestamp: v.number(),
    toTimestamp: v.number(),
  },
  handler: async (ctx, args): Promise<GetPromoterTicketKpisResponse> => {
    const { fromTimestamp, toTimestamp } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [UserRole.Promoter]);
      const clerkUserId = identity.id as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
          .unique()
      );

      const events = await ctx.db
        .query("events")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", user.organizationId)
        )
        .collect();

      const getTicketsForRange = async (from: number, to: number) => {
        const filteredEventIds = events
          .filter((event) => event.startTime >= from && event.startTime <= to)
          .map((e) => e._id);

        const ticketsArrays = await Promise.all(
          filteredEventIds.map((eventId) =>
            ctx.db
              .query("tickets")
              .withIndex("by_eventId_and_promoterUserId", (q) =>
                q.eq("eventId", eventId).eq("promoterUserId", user._id)
              )
              .collect()
          )
        );

        return ticketsArrays.flat();
      };

      const currentTickets = await getTicketsForRange(
        fromTimestamp,
        toTimestamp
      );
      const previousFrom = fromTimestamp - (toTimestamp - fromTimestamp);
      const previousTickets = await getTicketsForRange(
        previousFrom,
        fromTimestamp
      );

      const countByGender = (tickets: any[]) => ({
        maleCount: tickets.filter((t) => t.gender === Gender.Male).length,
        femaleCount: tickets.filter((t) => t.gender === Gender.Female).length,
      });

      const currentStats = countByGender(currentTickets);
      const previousStats = countByGender(previousTickets);

      const getChange = (current: number, previous: number) => {
        if (previous === 0) return current === 0 ? 0 : 100;
        return ((current - previous) / previous) * 100;
      };

      const generateDateMap = (from: number, to: number) => {
        const days: Record<string, { male: number; female: number }> = {};
        let cursor = startOfPstDay(from);
        const end = startOfPstDay(to);

        while (cursor <= end) {
          const key = formatToPstShortDate(cursor.toMillis());
          days[key] = { male: 0, female: 0 };
          cursor = cursor.plus({ days: 1 });
        }

        return days;
      };

      const dailyCounts = generateDateMap(fromTimestamp, toTimestamp);

      for (const ticket of currentTickets) {
        const dateKey = formatToPstShortDate(
          startOfPstDay(ticket._creationTime).toMillis()
        );
        if (dateKey && dailyCounts[dateKey]) {
          if (ticket.gender === Gender.Male) dailyCounts[dateKey].male += 1;
          if (ticket.gender === Gender.Female) dailyCounts[dateKey].female += 1;
        }
      }

      const dailyTicketSales = Object.entries(dailyCounts).map(
        ([date, { male, female }]) => ({
          date,
          male,
          female,
        })
      );

      const dayCount =
        Math.ceil((toTimestamp - fromTimestamp) / (1000 * 60 * 60 * 24)) || 1;

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          totalMale: {
            value: currentStats.maleCount,
            change: getChange(currentStats.maleCount, previousStats.maleCount),
          },
          totalFemale: {
            value: currentStats.femaleCount,
            change: getChange(
              currentStats.femaleCount,
              previousStats.femaleCount
            ),
          },
          avgMalePerDay: {
            value: currentStats.maleCount / dayCount,
            change: getChange(
              currentStats.maleCount / dayCount,
              previousStats.maleCount / dayCount
            ),
          },
          avgFemalePerDay: {
            value: currentStats.femaleCount / dayCount,
            change: getChange(
              currentStats.femaleCount / dayCount,
              previousStats.femaleCount / dayCount
            ),
          },
          dailyTicketSales,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getTicketSalesByPromoterWithDetails = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetTicketSalesByPromoterResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Moderator,
        UserRole.Promoter,
      ]);

      const clerkUserId = identity.id as string;
      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .first()
      );

      const event = validateEvent(await ctx.db.get(args.eventId));
      isUserInCompanyOfEvent(user, event);

      if (!event.ticketInfoId) {
        return {
          status: ResponseStatus.SUCCESS,
          data: { tickets: [], ticketTotals: null },
        };
      }

      const isManager = [
        UserRole.Admin,
        UserRole.Hostly_Admin,
        UserRole.Hostly_Moderator,
        UserRole.Manager,
        UserRole.Moderator,
      ].includes(user.role as UserRole);

      const allTickets = await ctx.db
        .query("tickets")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .collect();

      const ticketsToUse = isManager
        ? allTickets
        : allTickets.filter((t) => t.promoterUserId === user._id);

      const grouped = new Map<
        Id<"users">,
        {
          promoterId: Id<"users">;
          promoterName: string;
          maleCount: number;
          femaleCount: number;
        }
      >();

      let totalMales = 0;
      let totalFemales = 0;

      for (const ticket of ticketsToUse) {
        const promoterId = ticket.promoterUserId;
        if (!promoterId) continue;

        const existing = grouped.get(promoterId) ?? {
          promoterId,
          promoterName: "",
          maleCount: 0,
          femaleCount: 0,
        };

        if (ticket.gender === "male") {
          existing.maleCount += 1;
          totalMales += 1;
        } else if (ticket.gender === "female") {
          existing.femaleCount += 1;
          totalFemales += 1;
        }

        grouped.set(promoterId, existing);
      }

      // Fetch promoter names
      const promoterIds = Array.from(grouped.keys());
      const users = await Promise.all(promoterIds.map((id) => ctx.db.get(id)));

      users.forEach((u) => {
        if (!u) return;
        const group = grouped.get(u._id);
        if (group) group.promoterName = u.name ?? "Unknown";
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          tickets: Array.from(grouped.values()).sort(
            (a, b) =>
              b.maleCount + b.femaleCount - (a.maleCount + a.femaleCount)
          ),
          ticketTotals: isManager
            ? {
                maleCount: totalMales,
                femaleCount: totalFemales,
              }
            : null,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
