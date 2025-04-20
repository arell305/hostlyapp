import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { requireAuthenticatedUser } from "../utils/auth";
import { ResponseStatus, UserRole } from "@/types/enums";
import { validateOrganization } from "./backendUtils/validation";
import { internal } from "./_generated/api";
import { handleError, isUserInOrganization } from "./backendUtils/helper";
import { GetTotalRevenueByOrganizationResponse } from "@/types/convex-types";

export const insertConnectedPayment = internalMutation({
  args: {
    eventId: v.id("events"),
    stripePaymentIntentId: v.string(),
    email: v.string(),
    totalAmount: v.number(),
    promoCode: v.union(v.string(), v.null()),
    maleCount: v.number(),
    femaleCount: v.number(),
    status: v.string(),
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
      status,
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
          status,
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

      const filtered = payments.filter(
        (p) =>
          p.status === "succeeded" &&
          p._creationTime >= fromTimestamp &&
          p._creationTime <= toTimestamp
      );

      const totalRevenue = filtered.reduce((sum, p) => sum + p.totalAmount, 0);

      const totalTicketsSold = filtered.reduce(
        (sum, p) => sum + p.maleCount + p.femaleCount,
        0
      );

      const msPerDay = 1000 * 60 * 60 * 24;
      const numberOfDays = Math.max(
        1,
        Math.ceil((toTimestamp - fromTimestamp) / msPerDay)
      );

      const averageDailyRevenue = totalRevenue / numberOfDays;
      const averageDailyTicketsSold = totalTicketsSold / numberOfDays;
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          totalRevenue,
          averageDailyRevenue,
          totalTicketsSold,
          averageDailyTicketsSold,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
