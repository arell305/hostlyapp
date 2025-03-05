// import { httpRouter } from "convex/server";
// import { httpAction } from "./_generated/server";
// import { internal } from "./_generated/api";

// const http = httpRouter();

// http.route({
//   path: "/stripe",
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     const signature: string = request.headers.get("stripe-signature") as string;
//     const result = await ctx.runAction(internal.stripe.fulfill, {
//       signature,
//       payload: await request.text(),
//     });
//     if (result.success) {
//       return new Response(null, {
//         status: 200,
//       });
//     } else {
//       return new Response("Webhook Error", {
//         status: 400,
//       });
//     }
//   }),
// });

// export default http;
import { httpRouter } from "convex/server";

import { api, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { isOrganizationJSON } from "../utils/helpers";
import { ResponseStatus, UserRole, UserRoleEnum } from "../utils/enum";
import { RoleConvex } from "./schema";
import { createClerkClient } from "@clerk/backend";
import { stripe } from "./backendUtils/stripe";
// import { stripeWebhook } from "./webhooks/stripeWebhook";

const http = httpRouter();

http.route({
  path: "/stripeWebhook", // 🔹 No `/api/`
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const sig = request.headers.get("stripe-signature"); // 🔹 Extract headers

    if (!sig) {
      console.error("❌ Missing Stripe signature header!");
      return new Response("Webhook Error: Missing headers", { status: 400 });
    }

    try {
      // ✅ Verify Webhook Signature
      const event = await stripe.webhooks.constructEventAsync(
        payload,
        sig,
        process.env.STRIPE_WEBHOOKS_SECRET!
      );

      console.log("✅ Stripe Webhook Event Received:", event.type);

      if (event.type === "checkout.session.completed") {
        console.log("✅ Checkout Session Completed:", event.data.object);
        console.log("meta", event.data.object.metadata);
      }
      if (event.type === "payment_intent.succeeded") {
        console.log("payment intent succeed", event.data.object);
      }
      return new Response("Success", { status: 200 });
    } catch (error) {
      console.error("❌ Stripe Webhook Verification Failed:", error);
      return new Response("Webhook Verification Failed", { status: 400 });
    }
  }),
});

// export default http;

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
          "svix-signature": headerPayload.get("svix-signature")!,
        },
      });
      switch (result.type) {
        case "user.created":
          // Check if a user with the same email already exists
          const existingUser = await ctx.runQuery(
            internal.users.findUserByEmail,
            {
              email: result.data.email_addresses[0]?.email_address,
            }
          );
          if (existingUser && existingUser.organizationId) {
            // If user exists with the same email and has an organizationId, update clerkUserId
            const updateUserPromise = ctx.runMutation(
              internal.users.updateUser,
              {
                email: result.data.email_addresses[0]?.email_address,
                name: `${result.data.first_name} ${result.data.last_name}`,
                imageUrl: result.data.image_url,
              }
            );

            // const addClerkUserIdPromise = ctx.runMutation(
            //   internal.organizations.addClerkUserId,
            //   {
            //     clerkOrganizationId: existingUser.clerkOrganizationId,
            //     clerkUserId: result.data.id,
            //   }
            // );

            // Run both mutations in parallel
            await Promise.all([updateUserPromise]);
            return new Response(JSON.stringify({ message: "Success" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          const existingCustomer = await ctx.runQuery(
            internal.customers.findCustomerByEmail,
            {
              email: result.data.email_addresses[0]?.email_address,
            }
          );
          // if the user created is a stripe customer
          if (existingCustomer) {
            await ctx.runMutation(internal.users.createUser, {
              email: result.data.email_addresses[0]?.email_address,
              clerkUserId: result.data.id,
              customerId: existingCustomer._id,
              role: UserRole.Admin,
              name: `${result.data.first_name} ${result.data.last_name}`,
              imageUrl: result.data.image_url,
            });
            return new Response(JSON.stringify({ message: "Success" }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          // Else create a new user
          await ctx.runMutation(internal.users.createUser, {
            email: result.data.email_addresses[0]?.email_address,
            clerkUserId: result.data.id,
            role: null,
            name: `${result.data.first_name} ${result.data.last_name}`,
          });
          return new Response(JSON.stringify({ message: "Success" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        // case "organizationInvitation.created":
        //   await ctx.runMutation(internal.users.createUser, {
        //     email: result.data.email_address,
        //     clerkOrganizationId: result.data.organization_id,
        //     acceptedInvite: false,
        //     role: result.data.role as UserRole,
        //   });
        //   return new Response(JSON.stringify({ message: "Success" }), {
        //     status: 200,
        //     headers: { "Content-Type": "application/json" },
        //   });
        case "organizationInvitation.accepted":
          const organization = await ctx.runQuery(
            internal.organizations.internalGetOrganizationByClerkId,
            { clerkOrganizationId: result.data.organization_id }
          );

          await ctx.runMutation(internal.users.createUser, {
            email: result.data.email_address,
            clerkUserId: result.data.id,
            role: result.data.role as UserRole,
            organizationId: organization._id,
          });
          return new Response(JSON.stringify({ message: "Success" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        case "organization.created":
          // await ctx.runMutation(internal.organizations.createOrganization, {
          //   clerkOrganizationId: result.data.id,
          //   name: result.data.name,
          //   clerkUserId: result.data.created_by,
          // });

          // await ctx.runMutation(internal.users.updateUserById, {
          //   clerkUserId: result.data.created_by,
          //   clerkOrganizationId: result.data.id,
          // });

          // const user = await ctx.runQuery(api.users.findUserByClerkId, {
          //   clerkUserId: result.data.created_by,
          // });

          // if (user.status === ResponseStatus.SUCCESS) {
          //   const customer = await ctx.runQuery(
          //     internal.customers.findCustomerByEmail,
          //     {
          //       email: user.data.user.email,
          //     }
          //   );
          //   console.log("customer", customer);
          //   const clerkClient = createClerkClient({
          //     secretKey: process.env.CLERK_SECRET_KEY,
          //   });
          //   await clerkClient.organizations.updateOrganizationMetadata(
          //     result.data.id,
          //     {
          //       publicMetadata: {
          //         status: customer?.subscriptionStatus,
          //         tier: customer?.subscriptionTier,
          //       },
          //     }
          //   );

          //   return new Response(JSON.stringify({ message: "Success" }), {
          //     status: 200,
          //     headers: { "Content-Type": "application/json" },
          //   });
          // }

          // console.log("Organization already exists with ID");
          return new Response(JSON.stringify({ message: "Success" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });

        case "organization.updated":
          await ctx.runMutation(internal.organizations.updateOrganization, {
            clerkOrganizationId: result.data.id,
            imageUrl: result.data.image_url,
            name: result.data.name,
          });
          return new Response(JSON.stringify({ message: "Success" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
      }
      return new Response(JSON.stringify({ message: "Success" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.log(err);
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

// http.route({
//   path: "/pdfmonkey", // Define your new webhook path
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     const payloadString = await request.text();
//     const payload = JSON.parse(payloadString); // Parse incoming JSON payload

//     try {
//       console.log("Received document event:", payload);

//       switch (payload.event) {
//         case "documents.generation.success":
//           const downloadUrl = payload.data.download_url;
//           console.log("PDF generated successfully! Download URL:", downloadUrl);
//           // Add logic to handle successful PDF generation (e.g., send email)
//           break;

//         case "documents.generation.failed":
//           console.error("Document generation failed:", payload.data);
//           // Handle failure (e.g., log error, notify user)
//           break;

//         default:
//           console.log("Unhandled event type:", payload.event);
//       }

//       return new Response("Webhook received", { status: 200 });
//     } catch (error) {
//       console.error("Error processing document event:", error);
//       return new Response("Webhook Error", { status: 400 });
//     }
//   }),
// });

// http.route({
//   path: "/stripe-webhook",
//   method: "POST",
//   handler: stripeWebhook,
// });

export default http;

// In need to get subscriptionTier from customer
