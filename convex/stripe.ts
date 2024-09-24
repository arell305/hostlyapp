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
import { Customer } from "@/types";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { getFutureISOString } from "../utils/helpers";

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
    subscriptionTier: v.union(
      v.literal("Standard"),
      v.literal("Plus"),
      v.literal("Elite")
    ),
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
