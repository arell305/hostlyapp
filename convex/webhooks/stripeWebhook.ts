// import { httpAction } from "../_generated/server";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.STRIPE_KEY!, {
//   apiVersion: "2024-06-20",
// });

// export const stripeWebhook = httpAction(async (ctx, req) => {
//   const signature = req.headers.get("stripe-signature");
//   const rawBody = await req.text(); // Read raw body for Stripe signature verification

//   if (!signature) {
//     return new Response("Missing Stripe signature", { status: 400 });
//   }

//   let event: Stripe.Event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//   } catch (err: any) {
//     console.error("Webhook verification failed:", err.message);
//     return new Response("Webhook error", { status: 400 });
//   }

//   console.log("Received Stripe Webhook:", event.type);

//   switch (event.type) {
//     case "account.updated":
//       console.log("event", event);

//       break;

//     default:
//       console.log("Unhandled event type:", event.type);
//   }

//   return new Response("Webhook received", { status: 200 });
// });
