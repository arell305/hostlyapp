import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { SubscriptionStatus, SubscriptionTier } from "../utils/enum";
import { Customer } from "../app/types";
import { getFutureISOString } from "../utils/helpers";
import { SubscriptionTierConvex } from "./schema";
import { DateTime } from "luxon";
import { internal } from "./_generated/api";

export const insertCustomerAndSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    email: v.string(),
    paymentMethodId: v.string(),
    subscriptionTier: SubscriptionTierConvex,
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
      const nextPayment = args.trialEndDate || getFutureISOString(30);
      const customerId = await ctx.db.insert("customers", {
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        email: args.email,
        paymentMethodId: args.paymentMethodId,
        subscriptionStatus: args.subscriptionStatus,
        subscriptionTier: args.subscriptionTier,
        trialEndDate: args.trialEndDate,
        cancelAt: null,
        nextPayment,
        guestListEventCount: 0,
      });
      await ctx.scheduler.runAt(
        DateTime.fromISO(nextPayment).toMillis(),
        internal.customers.resetGuestListEventAndPayment,
        { customerId }
      );
      console.log(
        `Scheduled resetGuestListEvent for customer ${customerId} at ${nextPayment}`
      );
      return customerId;
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
  subscriptionTier: v.optional(SubscriptionTierConvex), // Adjust if SubscriptionTier has specific values
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
    return id;
  },
});

export const getCustomerSubscriptionTier = query({
  args: { clerkOrganizationId: v.string() },
  handler: async (ctx, args) => {
    // First, find the organization by its clerkOrganizationId
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrganizationId", (q) =>
        q.eq("clerkOrganizationId", args.clerkOrganizationId)
      )
      .first();
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Then, get the customer associated with this organization
    const customer = await ctx.db.get(organization.customerId);

    if (!customer) {
      throw new Error("Customer not found for this organization");
    }

    // Return the subscription tier
    return {
      subscriptionTier: customer.subscriptionTier,
      guestListEventCount: customer.guestListEventCount,
      customerId: customer._id,
      nextCycle: customer.nextPayment,
    };
  },
});

export const updateGuestListEventCount = mutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    // Fetch the customer from the database
    const customer = await ctx.db.get(args.customerId);

    // Check if the customer exists
    if (!customer) {
      throw new Error("Customer not found");
    }

    // Ensure the customer is on the Plus subscription tier
    if (customer.subscriptionTier !== SubscriptionTier.PLUS) {
      throw new Error("Customer is not on the Plus tier");
    }

    // Increment the guest list event count
    const updatedCount = (customer.guestListEventCount || 0) + 1;

    // Update the customer's guest list event count in the database
    await ctx.db.patch(args.customerId, { guestListEventCount: updatedCount });

    return {
      success: true,
      remainingEvents: 3 - updatedCount, // Assuming a maximum of 4 events
    };
  },
});

export const resetGuestListEventAndPayment = internalMutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, { customerId }) => {
    // Fetch the customer's data
    const customer = await ctx.db.get(customerId);

    if (!customer) {
      console.log(`Customer with ID ${customerId} does not exist.`);
      return;
    }

    // Check if `nextPayment` is null and stop scheduling if it is
    if (!customer.nextPayment) {
      console.log(
        `Stopping scheduler for customer ${customerId} as nextPayment is null.`
      );
      return;
    }
    console.log("updating count");
    // Reset the guestListEventCount
    await ctx.db.patch(customerId, {
      guestListEventCount: 0,
    });

    // Calculate the new `nextPayment` date (e.g., 1 month from now)
    const nextPaymentDate = new Date(customer.nextPayment);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    // Update the customer’s `nextPayment` field in the database
    await ctx.db.patch(customerId, {
      nextPayment: nextPaymentDate.toISOString(),
    });

    // Schedule this function to run again at the new `nextPayment` date
    await ctx.scheduler.runAt(
      nextPaymentDate.getTime(),
      internal.customers.resetGuestListEventAndPayment,
      { customerId }
    );
  },
});
