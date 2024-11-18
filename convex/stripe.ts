"use node";

import Stripe from "stripe";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { createClerkClient } from "@clerk/backend";
import { findPromoIdByCode } from "./promoCode";
import {
  findCustomerByEmail,
  insertCustomerAndSubscription,
} from "./customers";
import { SubscriptionStatus, SubscriptionTier } from "../utils/enum";
import { Customer, CustomerWithPayment } from "@/types";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { getFutureISOString } from "../utils/helpers";
import { SubscriptionTierConvex } from "./schema";
import { DateTime } from "luxon";

// export const pay = action({
//   args: { priceId: v.string(), email: v.string() },
//   handler: async (ctx, args) => {
//     const domain = process.env.HOSTING_URL ?? "http://localhost:3000";
//     const stripe = new Stripe(process.env.STRIPE_KEY!, {
//       apiVersion: "2024-06-20",
//     });

//     const session = await stripe.checkout.sessions.create({
//       line_items: [{ price: args.priceId, quantity: 1 }],
//       customer_email: args.email,
//       mode: "subscription",
//       success_url: `${domain}/success`,
//       cancel_url: `${domain}/cancel`,
//     });

//     return session.url!;
//   },
// });

type ValidatePromoCodeResponse = {
  isValid: boolean;
  promoCodeId: string | null;
  discount: number | null;
};

export const validatePromoCode = action({
  args: { promoCode: v.string() },
  handler: async (ctx, args): Promise<ValidatePromoCodeResponse> => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });
    try {
      await ctx.runQuery(internal.promoCode.findPromoIdByCode, {
        promoCode: args.promoCode,
      });
      const promotionCodes = await stripe.promotionCodes.list({
        code: args.promoCode,
        active: true,
        limit: 1,
      });

      if (promotionCodes.data.length === 0) {
        return { isValid: false, promoCodeId: null, discount: null };
      }

      const promotionCode = promotionCodes.data[0];
      const coupon = promotionCode.coupon;

      if (
        coupon &&
        promotionCode.active &&
        (coupon.redeem_by === null ||
          coupon.redeem_by > Math.floor(Date.now() / 1000))
      ) {
        let discount: number | null = null;
        if (coupon.percent_off) {
          discount = coupon.percent_off;
        } else if (coupon.amount_off) {
          discount = coupon.amount_off / 100; // Convert cents to dollars
        }

        return {
          isValid: true,
          promoCodeId: promotionCode.id,
          discount: discount,
        };
      }
      return { isValid: false, promoCodeId: null, discount: null };
    } catch (error) {
      console.error("Error validating promo code:", error);
      return { isValid: false, promoCodeId: null, discount: null };
    }
  },
});

export const createStripeSubscription = action({
  args: {
    email: v.string(),
    paymentMethodId: v.string(),
    priceId: v.string(),
    promoCodeId: v.optional(v.union(v.string(), v.null())),
    subscriptionTier: SubscriptionTierConvex,
  },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });

    try {
      // Step 1: Check if the customer exists in your database
      const existingCustomer: Customer | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        {
          email: args.email,
        }
      );

      // Step 2: Check if the customer has an active or trialing subscription
      if (
        existingCustomer &&
        (existingCustomer.subscriptionStatus === SubscriptionStatus.ACTIVE ||
          existingCustomer.subscriptionStatus === SubscriptionStatus.TRIALING)
      ) {
        throw new Error(ERROR_MESSAGES.ACTIVE_SUBSCRIPTION_EXISTS);
      }

      // Step 3: Create a new Stripe customer if they don't exist, else reuse the existing Stripe customer
      let stripeCustomerId: string;
      if (existingCustomer) {
        stripeCustomerId = existingCustomer.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: args.email,
        });
        stripeCustomerId = customer.id;
      }

      // Step 4: Attach the payment method to the customer
      const paymentMethod = await stripe.paymentMethods.attach(
        args.paymentMethodId,
        {
          customer: stripeCustomerId,
        }
      );

      // Step 5: Set the payment method as default
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      // Step 6: Determine if the customer should receive a trial period
      let trialPeriodDays: number | undefined = undefined;
      let trialEndDate: string | null = null;

      // New customers are eligible for trials if they choose Standard or Plus
      if (
        !existingCustomer && // Trial only for new customers
        (args.subscriptionTier === SubscriptionTier.STANDARD ||
          args.subscriptionTier === SubscriptionTier.PLUS)
      ) {
        trialPeriodDays = 30;
      }

      // Step 7: Create the subscription (with or without trial)
      const subscriptionOptions: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: [{ price: args.priceId }],
        expand: ["latest_invoice.payment_intent"],
        ...(trialPeriodDays && { trial_period_days: trialPeriodDays }), // Only add trial if applicable
      };

      // Apply promo code if provided
      if (args.promoCodeId) {
        subscriptionOptions.promotion_code = args.promoCodeId;
      }

      const subscription =
        await stripe.subscriptions.create(subscriptionOptions);

      if (subscription.trial_end) {
        trialEndDate = new Date(subscription.trial_end * 1000).toISOString(); // Convert timestamp to ISO string
      }

      // Step 8: Insert or update customer and subscription info in your database
      if (existingCustomer && existingCustomer._id) {
        // Update customer subscription to ACTIVE if they had a previous account (no trial period)
        await ctx.runMutation(internal.customers.updateCustomer, {
          id: existingCustomer._id, // Update using the customer's ID
          updates: {
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            stripeSubscriptionId: subscription.id,
            paymentMethodId: args.paymentMethodId,
            subscriptionTier: args.subscriptionTier,
            trialEndDate: null, // No trial for existing customers
          },
        });
      } else {
        // Insert new customer if they don't exist
        await ctx.runMutation(
          internal.customers.insertCustomerAndSubscription,
          {
            stripeCustomerId,
            stripeSubscriptionId: subscription.id,
            email: args.email,
            paymentMethodId: args.paymentMethodId,
            subscriptionTier: args.subscriptionTier,
            subscriptionStatus:
              trialPeriodDays !== undefined
                ? SubscriptionStatus.TRIALING
                : SubscriptionStatus.ACTIVE,
            trialEndDate,
          }
        );

        // Step 9: Create an invitation using Clerk
        const createInvitation = async (email: string) => {
          const response = await fetch("https://api.clerk.dev/v1/invitations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email_address: email,
              ignore_existing: true,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Failed to create invitation: ${response.statusText}`
            );
          }

          return await response.json();
        };

        // Usage example
        await createInvitation(args.email);
      }
      // Return subscription details
      return { customerId: stripeCustomerId, subscriptionId: subscription.id };
    } catch (error: any) {
      if (error.message.includes(ERROR_MESSAGES.ACTIVE_SUBSCRIPTION_EXISTS)) {
        // Throw specific error that the frontend can handle
        throw new Error(ERROR_MESSAGES.ACTIVE_SUBSCRIPTION_EXISTS);
      }
      throw new Error(ERROR_MESSAGES.SUBSCRIPTION_CREATION_FAILED);
    }
  },
});

// export const fulfill = internalAction({
//   args: { signature: v.string(), payload: v.string() },
//   handler: async (ctx, { signature, payload }) => {
//     const stripe = new Stripe(process.env.STRIPE_KEY!, {
//       apiVersion: "2024-06-20",
//     });

//     const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET as string;
//     try {
//       const event = await stripe.webhooks.constructEventAsync(
//         payload,
//         signature,
//         webhookSecret
//       );
//       switch (event.type) {
//         case "customer.subscription.created":
//           const subscription = event.data.object as Stripe.Subscription;
//           const customer = await stripe.customers.retrieve(
//             subscription.customer as string
//           );

//           // Ensure customer is of the expected type
//           if (customer) {
//             // Update your database with the new subscription
//           }
//           // Process the subscription here
//           break;

//         default:
//           console.warn(`Unhandled event type ${event.type}`);
//       }
//       return { success: true };
//     } catch (err) {
//       console.error(err);
//       return { success: false, error: (err as { message: string }).message };
//     }
//   },
// });

export const updateSubscriptionPaymentMethod = action({
  args: {
    email: v.string(),
    newPaymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });

    try {
      const existingCustomer: Customer | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        {
          email: args.email,
        }
      );

      if (!existingCustomer) {
        throw new Error("Customer not found");
      }

      await stripe.paymentMethods.attach(args.newPaymentMethodId, {
        customer: existingCustomer.stripeCustomerId,
      });

      await stripe.customers.update(existingCustomer.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: args.newPaymentMethodId,
        },
      });

      if (existingCustomer.stripeSubscriptionId) {
        await stripe.subscriptions.update(
          existingCustomer.stripeSubscriptionId,
          {
            default_payment_method: args.newPaymentMethodId,
          }
        );
      }

      if (existingCustomer._id) {
        await ctx.runMutation(internal.customers.updateCustomer, {
          id: existingCustomer._id,
          updates: {
            paymentMethodId: args.newPaymentMethodId,
          },
        });
      }

      return { success: true, message: "Payment method updated successfully" };
    } catch (error: any) {
      console.error("Error updating payment method:", error);
      throw new Error("Failed to update payment method");
    }
  },
});

export const updateSubscriptionTier = action({
  args: {
    email: v.string(),
    newTier: v.union(
      v.literal(SubscriptionTier.STANDARD),
      v.literal(SubscriptionTier.PLUS),
      v.literal(SubscriptionTier.ELITE)
    ),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; message: string }> => {
    const { email, newTier } = args;
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });

    try {
      const existingCustomer: Customer | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email }
      );

      if (
        !existingCustomer ||
        !existingCustomer.stripeSubscriptionId ||
        !existingCustomer._id
      ) {
        throw new Error("Customer or subscription not found");
      }

      const subscription = await stripe.subscriptions.retrieve(
        existingCustomer.stripeSubscriptionId
      );

      const newPriceId = getPriceIdForTier(newTier);

      // Update the subscription in Stripe
      const updatedSubscription = await stripe.subscriptions.update(
        existingCustomer.stripeSubscriptionId,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: "always_invoice", // This will prorate immediately
        }
      );
      const nextPayment = getFutureISOString(30);

      // Update the customer record in your database
      await ctx.runMutation(internal.customers.updateCustomer, {
        id: existingCustomer._id,
        updates: {
          subscriptionTier: newTier,
          stripeSubscriptionId: updatedSubscription.id,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          nextPayment,
        },
      });

      await ctx.scheduler.runAt(
        DateTime.fromISO(nextPayment).toMillis(),
        internal.customers.resetGuestListEventAndPayment,
        { customerId: existingCustomer._id }
      );

      return {
        success: true,
        message: `Subscription updated to ${newTier} successfully`,
      };
    } catch (error) {
      console.error("Error updating subscription:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update subscription",
      };
    }
  },
});

type CalculateSubscriptionUpdateResult = {
  success: boolean;
  proratedAmount?: number;
  newMonthlyRate?: number;
  message?: string;
};

export const calculateAllSubscriptionUpdates = action({
  args: {
    email: v.string(),
    currentTier: v.union(
      v.literal(SubscriptionTier.STANDARD),
      v.literal(SubscriptionTier.PLUS),
      v.literal(SubscriptionTier.ELITE)
    ),
    percentageDiscount: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args
  ): Promise<Record<SubscriptionTier, CalculateSubscriptionUpdateResult>> => {
    const { email, currentTier, percentageDiscount } = args;
    const results: Record<SubscriptionTier, CalculateSubscriptionUpdateResult> =
      {
        [SubscriptionTier.STANDARD]: {
          success: false,
          message: "Not calculated",
        },
        [SubscriptionTier.PLUS]: { success: false, message: "Not calculated" },
        [SubscriptionTier.ELITE]: { success: false, message: "Not calculated" },
      };

    try {
      const customer = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email }
      );
      if (
        !customer ||
        !customer.stripeCustomerId ||
        !customer.stripeSubscriptionId
      ) {
        throw new Error("Customer or subscription not found");
      }

      const stripe = new Stripe(process.env.STRIPE_KEY!, {
        apiVersion: "2024-06-20",
      });
      const subscription = await stripe.subscriptions.retrieve(
        customer.stripeSubscriptionId
      );

      for (const tier of Object.values(SubscriptionTier)) {
        if (tier !== currentTier) {
          const newPriceId = getPriceIdForTier(tier);
          const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
            customer: customer.stripeCustomerId,
            subscription: customer.stripeSubscriptionId,
            subscription_items: [
              {
                id: subscription.items.data[0].id,
                price: newPriceId,
              },
            ],
            subscription_proration_date: Math.floor(Date.now() / 1000),
          });

          let minusAmount = subscription.items.data[0].price.unit_amount ?? 0;

          let newMonthlyRate =
            upcomingInvoice.lines.data.find(
              (line) => line.price?.id === newPriceId
            )?.amount ?? 0;

          // Apply discount if provided
          if (percentageDiscount) {
            // Calculate discounted amounts
            const discountFactor = 1 - percentageDiscount / 100;
            // proratedAmount *= discountFactor; // Apply discount to prorated amount
            newMonthlyRate *= discountFactor;
            minusAmount *= discountFactor; // Apply discount to new monthly rate
          }
          let proratedAmount = upcomingInvoice.amount_due - minusAmount;
          proratedAmount = Math.max(0, proratedAmount); // Ensure it's not negative

          results[tier] = {
            success: true,
            proratedAmount: Math.max(0, proratedAmount / 100), // Ensure final values are non-negative
            newMonthlyRate: Math.max(0, newMonthlyRate / 100),
          };
        }
      }

      return results;
    } catch (error) {
      console.error("Error calculating subscription updates:", error);
      return Object.fromEntries(
        Object.values(SubscriptionTier).map((tier) => [
          tier,
          {
            success: false,
            message: "Failed to calculate subscription update",
          },
        ])
      ) as Record<SubscriptionTier, CalculateSubscriptionUpdateResult>;
    }
  },
});
function getPriceIdForTier(tier: SubscriptionTier): string {
  switch (tier) {
    case SubscriptionTier.STANDARD:
      return "price_1PxexNRv8MX5Pza1YpAG3Znt";
    case SubscriptionTier.PLUS:
      return "price_1PxfAnRv8MX5Pza1kFwM4gmI";
    case SubscriptionTier.ELITE:
      return "price_1PxfD5Rv8MX5Pza1TJKtcBHK";
    default:
      throw new Error("Invalid subscription tier");
  }
}
