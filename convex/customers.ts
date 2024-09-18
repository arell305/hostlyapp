import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { SubscriptionStatus } from "../utils/enum";
import { Customer } from "../app/types";
import { getFutureISOString } from "../utils/helpers";

export const insertCustomerAndSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    email: v.string(),
    paymentMethodId: v.string(),
    subscriptionTier: v.union(
      v.literal("Standard"),
      v.literal("Plus"),
      v.literal("Elite")
    ),
    trialEndDate: v.union(v.string(), v.null()),
    subscriptionStatus: v.union(
      v.literal(SubscriptionStatus.ACTIVE),
      v.literal(SubscriptionStatus.TRIALING),
      v.literal(SubscriptionStatus.CANCELED),
      v.literal(SubscriptionStatus.INCOMPLETE),
      v.literal(SubscriptionStatus.INCOMPLETE_EXPIRED),
      v.literal(SubscriptionStatus.PAST_DUE),
      v.literal(SubscriptionStatus.UNPAID)
    ),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.insert("customers", {
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        email: args.email,
        paymentMethodId: args.paymentMethodId,
        subscriptionStatus: args.subscriptionStatus,
        subscriptionTier: args.subscriptionTier,
        trialEndDate: args.trialEndDate,
        cancelAt: null,
        nextPayment: args.trialEndDate || getFutureISOString(30),
      });
    } catch (error) {
      console.error("Error inserting customer into the database:", error);
      throw new Error("Failed to insert customer");
    }
  },
});

export const findCustomerByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const customer = await ctx.db
        .query("customers")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();

      // If a customer is found, map the `subscriptionStatus` string to the `SubscriptionStatus` enum
      if (customer) {
        return {
          ...customer,
          subscriptionStatus: customer.subscriptionStatus as SubscriptionStatus, // Cast or map the status
        } as Customer; // Ensure the returned type is the `Customer` interface
      }

      return null;
    } catch (error) {
      console.error("Error finding customer by email:", error);
      return null;
    }
  },
});

const allowedFields = {
  stripeCustomerId: v.optional(v.string()),
  subscriptionStatus: v.optional(v.string()), // Adjust if SubscriptionStatus has specific values
  trialEndDate: v.optional(v.union(v.string(), v.null())),
  stripeSubscriptionId: v.optional(v.string()),
  email: v.optional(v.string()),
  paymentMethodId: v.optional(v.string()),
  subscriptionTier: v.optional(v.string()), // Adjust if SubscriptionTier has specific values
};

export const updateCustomer = internalMutation({
  args: {
    id: v.id("customers"),
    updates: v.object(allowedFields), // Expect an object for updates
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;

    // Check if there are any valid fields to update
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
  },
});
