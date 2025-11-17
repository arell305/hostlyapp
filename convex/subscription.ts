import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { SubscriptionStatus } from "@/shared/types/enums";
import {
  validateCustomer,
  validateOrganization,
  validateSubscription,
} from "./backendUtils/validation";
import { SubscriptionStatusConvex, SubscriptionTierTypeConvex } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

export const getSubscriptionByCustomerId = internalQuery({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args): Promise<Doc<"subscriptions"> | null> => {
    return await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("customerId"), args.customerId))
      .first();
  },
});

export const getUsableSubscriptionByCustomerId = internalQuery({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args): Promise<Doc<"subscriptions"> | null> => {
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
    subscriptionTier: SubscriptionTierTypeConvex,
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
  },
});

export const getSubscriptionByCustomerAndStatus = internalQuery({
  args: {
    customerId: v.id("customers"),
    subscriptionStatus: SubscriptionStatusConvex,
  },
  handler: async (ctx, args): Promise<Doc<"subscriptions"> | null> => {
    const { customerId, subscriptionStatus } = args;

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
      .filter((q) => q.eq(q.field("subscriptionStatus"), subscriptionStatus))
      .first();
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
      subscriptionTier: v.optional(SubscriptionTierTypeConvex),
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
  },
});

export const deleteSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"subscriptions">> => {
    const { stripeSubscriptionId } = args;

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
      subscriptionTier: v.optional(SubscriptionTierTypeConvex),
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

    const subscription = validateSubscription(await ctx.db.get(subscriptionId));

    await ctx.db.patch(subscription._id, updates);
    return subscription._id;
  },
});
