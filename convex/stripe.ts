"use node";

import Stripe from "stripe";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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

export const createStripeSubscription = action({
  args: { email: v.string(), paymentMethodId: v.string(), priceId: v.string() }, // Include priceId for the subscription
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2024-06-20",
    });
    try {
      // Step 1: Create the Stripe customer
      const customer = await stripe.customers.create({
        email: args.email,
      });

      // Step 2: Attach the payment method to the customer
      const paymentMethod = await stripe.paymentMethods.attach(
        args.paymentMethodId,
        {
          customer: customer.id,
        }
      );

      // Step 3: Set the payment method as the default
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      // Step 4: Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: args.priceId }], // Use the provided priceId
        expand: ["latest_invoice.payment_intent"],
      });

      // Step 5: Call the separate mutation to store the customer and subscription in the database
      await ctx.runMutation(internal.customers.insertCustomerAndSubscription, {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        email: args.email,
        paymentMethodId: args.paymentMethodId,
      });

      return { customerId: customer.id, subscriptionId: subscription.id };
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw new Error("Failed to create subscription");
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
