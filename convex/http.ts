import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { WebhookHandlerResponse } from "../shared/types/convex-types";

const http = httpRouter();

http.route({
  path: "/stripeWebhook",
  method: "POST",
  handler: httpAction(async (ctx, request): Promise<Response> => {
    const signature: string = request.headers.get("stripe-signature") as string;
    const result = (await ctx.runAction(internal.stripe.fulfill, {
      signature,
      payload: await request.text(),
    })) as WebhookHandlerResponse;

    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response(result.error || "Webhook Error", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/stripeConnectedAccount",
  method: "POST",
  handler: httpAction(async (ctx, request): Promise<Response> => {
    const signature: string = request.headers.get("stripe-signature") as string;
    const result = (await ctx.runAction(internal.connectedAccounts.fulfill, {
      signature,
      payload: await request.text(),
    })) as WebhookHandlerResponse;

    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response(result.error || "Webhook Error", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/pdfMonkey",
  method: "POST",
  handler: httpAction(async (ctx, req): Promise<Response> => {
    const signature: string | null = req.headers.get("svix-signature");
    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }
    const headers = {
      svix_id: req.headers.get("svix-id") ?? "",
      svix_signature: req.headers.get("svix-signature") ?? "",
      svix_timestamp: req.headers.get("svix-timestamp") ?? "",
    };
    const result = (await ctx.runAction(internal.pdfMonkey.fulfill, {
      headers,
      payload: await req.text(),
    })) as WebhookHandlerResponse;

    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response(result.error || "Webhook Error", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request): Promise<Response> => {
    try {
      const payloadString = await request.text();
      const headers = {
        "svix-id": request.headers.get("svix-id")!,
        "svix-timestamp": request.headers.get("svix-timestamp")!,
        "svix-signature": request.headers.get("svix-signature")!,
      };

      const result = (await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers,
      })) as WebhookHandlerResponse;

      if (result.success) {
        return new Response(null, { status: 200 });
      } else {
        return new Response(result.error || "Webhook Error", { status: 400 });
      }
    } catch (err) {
      console.error("Error processing Clerk webhook:", err);
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});

export default http;
