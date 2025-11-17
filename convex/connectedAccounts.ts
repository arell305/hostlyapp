import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { ErrorMessages, UserRole } from "@/shared/types/enums";
import { WebhookResponse } from "@/shared/types/convex-types";
import { StripeAccountStatusConvex } from "./schema";
import { Doc, Id } from "./_generated/dataModel";
import {
  validateConnectedAccount,
  validateUser,
} from "./backendUtils/validation";
import { stripe } from "@/convex/functions/stripe";
import { requireAuthenticatedUser } from "../shared/utils/auth";
import {
  handleConnectedAccountUpdated,
  handlePaymentIntentSucceeded,
  verifyStripeConnectedWebhook,
} from "./functions/stripeConnect";

export const saveConnectedAccount = internalMutation({
  args: {
    customerId: v.id("customers"),
    stripeAccountId: v.string(),
    status: StripeAccountStatusConvex,
  },
  handler: async (ctx, args): Promise<Id<"connectedAccounts">> => {
    const existingAccount = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .first();

    let connectedAccountId: Id<"connectedAccounts">;
    if (existingAccount) {
      await ctx.db.patch(existingAccount._id, {
        stripeAccountId: args.stripeAccountId,
        status: args.status,
        lastStripeUpdate: Date.now(),
      });
      connectedAccountId = existingAccount._id;
    } else {
      connectedAccountId = await ctx.db.insert("connectedAccounts", {
        customerId: args.customerId,
        stripeAccountId: args.stripeAccountId,
        status: args.status,
        lastStripeUpdate: Date.now(),
      });
    }

    return existingAccount?._id || connectedAccountId;
  },
});

export const getConnectedAccountByCustomerId = internalQuery({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args): Promise<Doc<"connectedAccounts"> | null> => {
    return await ctx.db
      .query("connectedAccounts")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .first();
  },
});

export const deleteConnectedAccount = internalMutation({
  args: {
    connectedAccountId: v.id("connectedAccounts"),
  },
  handler: async (ctx, args): Promise<Id<"connectedAccounts">> => {
    const { connectedAccountId } = args;

    await ctx.db.patch(connectedAccountId, {
      status: "Disabled",
    });

    return connectedAccountId;
  },
});

export const getConnectedAccountByClerkUserId = query({
  args: {},
  handler: async (ctx): Promise<Doc<"connectedAccounts"> | null> => {
    const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
    const clerkUserId = idenitity.id as string;

    const user = validateUser(
      await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first(),
      true,
      true
    );

    const connectedAccount = await ctx.db
      .query("connectedAccounts")
      .withIndex("by_customerId", (q) => q.eq("customerId", user.customerId!))
      .first();
    false;

    if (!connectedAccount) {
      return null;
    }

    if (
      connectedAccount.status !== "Not Onboarded Yet" &&
      connectedAccount.status !== "Verified"
    ) {
      return null;
    }
    return connectedAccount;
  },
});

export const internalGetConnectedAccountByClerkUserId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"connectedAccounts">> => {
    const user = validateUser(
      await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId)
        )
        .first(),
      true,
      true
    );

    const connectedAccount = validateConnectedAccount(
      await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) => q.eq("customerId", user.customerId!))
        .first(),
      false
    );

    return connectedAccount;
  },
});

export async function deactivateStripeConnectedAccount(
  stripeAccountId: string
): Promise<void> {
  try {
    await stripe.accounts.update(stripeAccountId, { capabilities: {} });
  } catch (error) {
    console.error(
      `Failed to delete Stripe connected account ${stripeAccountId}:`,
      error
    );
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_DEACTIVATE_ERROR);
  }
}

export const updateConnectedAccountByStripeId = internalMutation({
  args: { stripeAccountId: v.string(), status: StripeAccountStatusConvex },
  handler: async (ctx, args): Promise<void> => {
    const connectedAcount = validateConnectedAccount(
      await ctx.db
        .query("connectedAccounts")
        .withIndex("by_stripeAccountId", (q) =>
          q.eq("stripeAccountId", args.stripeAccountId)
        )
        .first(),
      false
    );
    await ctx.db.patch(connectedAcount._id, { status: args.status });
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }): Promise<WebhookResponse> => {
    try {
      const event = await verifyStripeConnectedWebhook(payload, signature);
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(ctx, event.data.object);
          break;
        case "account.updated":
          await handleConnectedAccountUpdated(ctx, event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (err) {
      console.error("Error processing webhook:", err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});
