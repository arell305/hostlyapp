import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  ResponseStatus,
  SubscriptionStatus,
  SubscriptionTier,
} from "../utils/enum";
import {
  Customer,
  CustomerSchema,
  CustomerWithPayment,
  UpdateListEventCountResponse,
} from "../app/types";
import { getFutureISOString } from "../utils/helpers";
import { SubscriptionStatusConvex, SubscriptionTierConvex } from "./schema";
import { DateTime } from "luxon";
import { internal } from "./_generated/api";
import Stripe from "stripe";
import { ErrorMessages } from "@/utils/enums";

export const insertCustomerAndSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    email: v.string(),
    paymentMethodId: v.string(),
    subscriptionTier: SubscriptionTierConvex,
    trialEndDate: v.union(v.string(), v.null()),
    subscriptionStatus: SubscriptionStatusConvex,
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
  handler: async (ctx, args): Promise<Customer | null> => {
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
  subscriptionStatus: v.optional(SubscriptionStatusConvex), // Adjust if SubscriptionStatus has specific values
  trialEndDate: v.optional(v.union(v.string(), v.null())),
  stripeSubscriptionId: v.optional(v.string()),
  email: v.optional(v.string()),
  paymentMethodId: v.optional(v.string()),
  subscriptionTier: v.optional(SubscriptionTierConvex), // Adjust if SubscriptionTier has specific values
  nextPayment: v.optional(v.union(v.string(), v.null())),
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
      status: customer.subscriptionStatus,
    };
  },
});

export const updateGuestListEventCount = mutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args): Promise<UpdateListEventCountResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const customer: CustomerSchema | null = await ctx.db.get(args.customerId);

      if (!customer) {
        return {
          status: ResponseStatus.NOT_FOUND,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      if (customer.subscriptionTier !== SubscriptionTier.PLUS) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: "Not on Plus tier",
        };
      }
      const updatedCount: number = (customer.guestListEventCount || 0) + 1;
      await ctx.db.patch(args.customerId, {
        guestListEventCount: updatedCount,
      });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          remaingEvents: updatedCount,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
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
    if (
      customer.subscriptionStatus === SubscriptionStatus.CANCELED ||
      !customer.nextPayment
    ) {
      console.log(
        `Stopping scheduler for customer ${customerId} as subscription status is canceled.`
      );
      return;
    }
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

export const getCustomerDetails = action({
  args: {
    customerEmail: v.string(),
  },
  handler: async (ctx, args): Promise<CustomerWithPayment | null> => {
    let existingCustomer: Customer | null = null;

    try {
      // Fetch existing customer by email
      existingCustomer = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: args.customerEmail }
      );
    } catch (error) {
      console.error("Error fetching customer by email:", error);
      throw new Error("Failed to fetch customer details");
    }

    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    // Helper function to return the customer with optional payment details
    const createCustomerWithPayment = (
      brand?: string,
      last4?: string,
      currentSubscriptionAmount?: number,
      discountPercentage?: number
    ): CustomerWithPayment => ({
      ...existingCustomer!,
      brand,
      last4,
      currentSubscriptionAmount,
      discountPercentage,
    });
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });

    try {
      // Fetch payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: existingCustomer.stripeCustomerId,
        type: "card",
      });

      // Get the default payment method if available
      const defaultPaymentMethod = paymentMethods.data[0];

      // Fetch the subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(
        existingCustomer.stripeSubscriptionId
      );

      // Get the current price of the subscription
      const currentPrice = subscription.items.data[0].price;
      const amount = currentPrice.unit_amount; // Amount in cents

      // Extract discount information if available
      let discountPercentage = 0;

      if (subscription.discount) {
        discountPercentage = subscription.discount.coupon.percent_off || 0; // Get the discount percentage directly
      }
      console.log("discount Per", discountPercentage);

      // Return customer with payment details and subscription amount if available
      return createCustomerWithPayment(
        defaultPaymentMethod?.card?.brand, // Use optional chaining to avoid undefined error
        defaultPaymentMethod?.card?.last4,
        amount ? amount / 100 : 0,
        discountPercentage
      );
    } catch (error) {
      console.error(
        "Error fetching payment methods or subscription from Stripe:",
        error
      );
    }

    // Return customer without payment details as fallback
    return createCustomerWithPayment();
  },
});
export const cancelSubscription = action({
  args: { customerEmail: v.string() },
  handler: async (ctx, args) => {
    let existingCustomer: Customer | null = null;

    try {
      // Fetch existing customer by email
      existingCustomer = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: args.customerEmail }
      );
    } catch (error) {
      console.error("Error fetching customer by email:", error);
      throw new Error("Failed to fetch customer details");
    }

    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    // Initialize Stripe client
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });

    try {
      // Call Stripe's API to cancel the subscription but keep it active until the period ends
      await stripe.subscriptions.update(existingCustomer.stripeSubscriptionId, {
        cancel_at_period_end: true, // This will ensure the user can use the service until the next payment date
      });

      if (existingCustomer && existingCustomer._id) {
        // Update customer subscription to ACTIVE if they had a previous account (no trial period)
        await ctx.runMutation(internal.customers.updateCustomer, {
          id: existingCustomer._id, // Update using the customer's ID
          updates: {
            subscriptionStatus: SubscriptionStatus.CANCELED,
          },
        });
      }

      return {
        success: true,
        message:
          "Subscription canceled successfully, you will have access until the next payment date.",
      };
    } catch (err) {
      console.error("Error canceling subscription:", err);
      throw new Error("Failed to cancel subscription.");
    }
  },
});

export const resumeSubscription = action({
  args: { customerEmail: v.string() },
  handler: async (ctx, args) => {
    let existingCustomer: Customer | null = null;

    try {
      // Fetch existing customer by email
      existingCustomer = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: args.customerEmail }
      );
    } catch (error) {
      console.error("Error fetching customer by email:", error);
      throw new Error("Failed to fetch customer details");
    }

    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    // Initialize Stripe client
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });

    try {
      // Retrieve the subscription from Stripe using the subscription ID
      const subscription = await stripe.subscriptions.retrieve(
        existingCustomer.stripeSubscriptionId
      );

      if (subscription.cancel_at_period_end) {
        // Resume the subscription by setting cancel_at_period_end to false
        await stripe.subscriptions.update(
          existingCustomer.stripeSubscriptionId,
          {
            cancel_at_period_end: false, // Resuming the subscription
          }
        );

        // Optionally, update the subscription status in your database to "active"
        if (existingCustomer && existingCustomer._id) {
          // Update customer subscription to ACTIVE if they had a previous account (no trial period)
          await ctx.runMutation(internal.customers.updateCustomer, {
            id: existingCustomer._id, // Update using the customer's ID
            updates: {
              subscriptionStatus: SubscriptionStatus.ACTIVE,
            },
          });
        }
        return { success: true, message: "Subscription resumed successfully." };
      } else {
        // If the subscription is not canceled or it was already resumed
        return { success: false, message: "Subscription is already active." };
      }
    } catch (err) {
      console.error("Error resuming subscription:", err);
      throw new Error("Failed to resume subscription.");
    }
  },
});
