import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import {
  ErrorMessages,
  ResponseStatus,
  SubscriptionStatus,
} from "@/types/enums";
import { SubscriptionBillingCycle } from "@/types/types";
import { EventSchema, SubscriptionSchema } from "@/types/schemas-types";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateCustomer,
  validateOrganization,
  validateSubscription,
} from "./backendUtils/validation";
import {
  handleError,
  isUserInOrganization,
  shouldExposeError,
} from "./backendUtils/helper";
import { GetSubDatesAndGuestEventsCountByDateResponse } from "@/types/convex-types";
import { SubscriptionStatusConvex, SubscriptionTierConvex } from "./schema";
import { Id } from "./_generated/dataModel";

import { DateTime } from "luxon";
import { TIME_ZONE } from "@/types/constants";
import { getStripeBillingCycle } from "../utils/helpers";

export const getSubDatesAndGuestEventsCountByDate = query({
  args: {
    organizationId: v.id("organizations"),
    date: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetSubDatesAndGuestEventsCountByDateResponse> => {
    const { organizationId, date } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx);

      const organization = validateOrganization(
        await ctx.db.get(organizationId)
      );
      isUserInOrganization(identity, organization.clerkOrganizationId);

      const subscription = validateSubscription(
        await ctx.db
          .query("subscriptions")
          .withIndex("by_customerId", (q) =>
            q.eq("customerId", organization.customerId)
          )
          .first()
      );

      const inputDate = DateTime.fromMillis(date).setZone(TIME_ZONE);
      const subscriptionStartDate = DateTime.fromMillis(
        subscription._creationTime
      ).setZone(TIME_ZONE);

      if (inputDate < subscriptionStartDate) {
        return {
          status: ResponseStatus.SUCCESS,
          data: null,
        };
      }

      const { startDate, endDate } = getStripeBillingCycle(
        inputDate,
        subscription.stripeBillingCycleAnchor
      );

      const allEvents: EventSchema[] = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("organizationId"), organization._id))
        .filter((q) => q.gte(q.field("startTime"), startDate.toMillis()))
        .filter((q) => q.lte(q.field("startTime"), endDate.toMillis()))
        .collect();

      const eventIds = allEvents.map((e) => e._id);

      const guestListInfos = await ctx.db
        .query("guestListInfo")
        .withIndex("by_eventId")
        .collect();

      const guestEventIds = new Set(
        guestListInfos.map((g) => g.eventId.toString())
      );

      const filteredEvents = allEvents.filter((e) =>
        guestEventIds.has(e._id.toString())
      );

      const billingCycle: SubscriptionBillingCycle = {
        startDate: startDate.toMillis(),
        endDate: endDate.toMillis(),
        eventCount: filteredEvents.length,
      };

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          billingCycle,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getSubscriptionByCustomerId = internalQuery({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args): Promise<SubscriptionSchema | null> => {
    try {
      return await ctx.db
        .query("subscriptions")
        .filter((q) => q.eq(q.field("customerId"), args.customerId))
        .first();
    } catch (error) {
      console.error("Error fetching subscription:", error);
      throw new Error(ErrorMessages.SUBSCRIPTION_DB_QUERY_BY_CUSTOMER);
    }
  },
});

export const getUsableSubscriptionByCustomerId = internalQuery({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args): Promise<SubscriptionSchema | null> => {
    try {
      return await ctx.db
        .query("subscriptions")
        .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
        .filter((q) =>
          q.or(
            q.eq(q.field("subscriptionStatus"), SubscriptionStatus.ACTIVE),
            q.eq(q.field("subscriptionStatus"), SubscriptionStatus.TRIALING),
            q.eq(
              q.field("subscriptionStatus"),
              SubscriptionStatus.PENDING_CANCELLATION
            ),
            q.eq(q.field("subscriptionStatus"), SubscriptionStatus.PAST_DUE)
          )
        )
        .first();
    } catch (error) {
      console.error("Error fetching usable subscription:", error);
      throw new Error(ErrorMessages.SUBSCRIPTION_DB_QUERY_BY_CUSTOMER);
    }
  },
});

export const insertSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    priceId: v.string(),
    trialEnd: v.union(v.number(), v.null()),
    currentPeriodEnd: v.number(),
    stripeBillingCycleAnchor: v.number(),
    subscriptionStatus: SubscriptionStatusConvex,
    subscriptionTier: SubscriptionTierConvex,
    customerId: v.id("customers"),
    currentPeriodStart: v.number(),
    amount: v.number(),
    discount: v.optional(
      v.object({
        stripePromoCodeId: v.string(),
        discountPercentage: v.number(),
      })
    ),
  },
  handler: async (ctx, args): Promise<Id<"subscriptions">> => {
    const {
      stripeSubscriptionId,
      priceId,
      trialEnd,
      currentPeriodStart,
      currentPeriodEnd,
      stripeBillingCycleAnchor,
      subscriptionStatus,
      subscriptionTier,
      customerId,
      amount,
      discount,
    } = args;
    try {
      return await ctx.db.insert("subscriptions", {
        stripeSubscriptionId,
        priceId,
        trialEnd,
        currentPeriodStart,
        currentPeriodEnd,
        stripeBillingCycleAnchor,
        subscriptionStatus,
        subscriptionTier,
        guestListEventsCount: 0,
        customerId,
        amount,
        discount,
      });
    } catch (error) {
      console.error("Error inserting subscription into the database:", error);
      throw new Error(ErrorMessages.SUBSCRIPTION_DB_CREATE);
    }
  },
});

export const getSubscriptionByCustomerAndStatus = internalQuery({
  args: {
    customerId: v.id("customers"),
    subscriptionStatus: SubscriptionStatusConvex,
  },
  handler: async (ctx, args): Promise<SubscriptionSchema | null> => {
    const { customerId, subscriptionStatus } = args;

    try {
      return await ctx.db
        .query("subscriptions")
        .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
        .filter((q) => q.eq(q.field("subscriptionStatus"), subscriptionStatus))
        .first();
    } catch (error) {
      console.error("Error fetching subscription:", error);
      throw new Error(ErrorMessages.SUBSCRIPTION_DB_QUERY);
    }
  },
});

export const updateSubscriptionBySubscriptionId = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    updates: v.object({
      subscriptionStatus: v.optional(SubscriptionStatusConvex),
      currentPeriodStart: v.optional(v.number()),
      currentPeriodEnd: v.optional(v.number()),
      guestListEventsCount: v.optional(v.number()),
      trialEnd: v.optional(v.number()),
      subscriptionTier: v.optional(SubscriptionTierConvex),
      priceId: v.optional(v.string()),
      discount: v.optional(
        v.object({
          stripePromoCodeId: v.optional(v.string()),
          discountPercentage: v.optional(v.number()),
        })
      ),
      amount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<Id<"subscriptions">> => {
    const { stripeSubscriptionId, updates } = args;

    try {
      const subscription = validateSubscription(
        await ctx.db
          .query("subscriptions")
          .withIndex("by_stripeSubscriptionId", (q) =>
            q.eq("stripeSubscriptionId", stripeSubscriptionId)
          )
          .first()
      );

      await ctx.db.patch(subscription._id, updates);
      return subscription._id;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw new Error(ErrorMessages.SUBSCRIPTION_DB_UPDATE);
    }
  },
});

export const deleteSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"subscriptions">> => {
    const { stripeSubscriptionId } = args;

    try {
      const subscription = validateSubscription(
        await ctx.db
          .query("subscriptions")
          .withIndex("by_stripeSubscriptionId", (q) =>
            q.eq("stripeSubscriptionId", stripeSubscriptionId)
          )
          .first()
      );

      const customer = validateCustomer(
        await ctx.db.get(subscription.customerId)
      );
      const organization = validateOrganization(
        await ctx.db
          .query("organizations")
          .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
          .first()
      );

      Promise.all([
        ctx.db.patch(subscription._id, {
          subscriptionStatus: SubscriptionStatus.CANCELED,
        }),
        ctx.db.patch(customer._id, { isActive: false }),
        ctx.db.patch(organization._id, { isActive: false }),
      ]);

      return subscription._id;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw new Error(ErrorMessages.SUBSCRIPTION_DB_UPDATE);
    }
  },
});

export const updateSubscriptionById = internalMutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    updates: v.object({
      subscriptionStatus: v.optional(SubscriptionStatusConvex),
      currentPeriodStart: v.optional(v.number()),
      currentPeriodEnd: v.optional(v.number()),
      guestListEventsCount: v.optional(v.number()),
      trialEnd: v.optional(v.number()),
      subscriptionTier: v.optional(SubscriptionTierConvex),
      priceId: v.optional(v.string()),
      discount: v.optional(
        v.object({
          stripePromoCodeId: v.optional(v.string()),
          discountPercentage: v.optional(v.number()),
        })
      ),
      amount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<Id<"subscriptions">> => {
    const { subscriptionId, updates } = args;

    try {
      const subscription = validateSubscription(
        await ctx.db.get(subscriptionId)
      );

      await ctx.db.patch(subscription._id, updates);
      return subscription._id;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw new Error(ErrorMessages.SUBSCRIPTION_DB_UPDATE);
    }
  },
});
