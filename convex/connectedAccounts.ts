import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { ResponseStatus, StripeAccountStatus, UserRole } from "../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { ConnectedAccountsSchema, UserSchema } from "@/types/schemas-types";
import {
  GetConnectedAccountByClerkUserIdResponse,
  GetConnectedAccountStatusBySlugResponse,
} from "@/types/convex-types";
import { StripeAccountStatusConvex } from "./schema";
import { DeleteConnectedAccountResponse } from "@/types/convex/internal-types";
import { Id } from "./_generated/dataModel";
import { OrganizationSchema } from "@/types/types";
import {
  validateConnectedAccount,
  validateOrganization,
  validateUser,
} from "./backendUtils/validation";
import { stripe } from "./backendUtils/stripe";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  handlePaymentIntentSucceeded,
  verifyStripeConnectedWebhook,
} from "./backendUtils/stripeConnect";

export const saveConnectedAccount = internalMutation({
  args: {
    customerId: v.id("customers"),
    stripeAccountId: v.string(),
    status: StripeAccountStatusConvex,
  },
  handler: async (ctx, args): Promise<Id<"connectedAccounts">> => {
    try {
      const existingAccount: ConnectedAccountsSchema | null = await ctx.db
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
    } catch (error) {
      console.error(ErrorMessages.CONNECTED_ACCOUNT_UPDATE_ERROR, error);
      throw new Error(ErrorMessages.CONNECTED_ACCOUNT_UPDATE_ERROR);
    }
  },
});

export const getConnectedAccountByCustomerId = internalQuery({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args): Promise<ConnectedAccountsSchema> => {
    try {
      const account: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
        .first();

      if (!account) {
        throw new Error(ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND);
      }

      return account;
    } catch (error) {
      console.error("Error in getConnectedAccountByCustomerId:", error);
      throw new Error("Failed to fetch connected account");
    }
  },
});

export const deleteConnectedAccount = internalMutation({
  args: {
    connectedAccountId: v.id("connectedAccounts"),
  },
  handler: async (ctx, args): Promise<DeleteConnectedAccountResponse> => {
    const { connectedAccountId } = args;
    try {
      await ctx.db.patch(connectedAccountId, {
        status: StripeAccountStatus.DISABLED,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          connectedAccountId,
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

export const getConnectedAccountByClerkUserId = query({
  args: {},
  handler: async (ctx): Promise<GetConnectedAccountByClerkUserIdResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
      const clerkUserId = idenitity.id as string;

      const user: UserSchema | null = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();

      const validatedUser = validateUser(user, true, true);

      const connectedAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) =>
          q.eq("customerId", validatedUser.customerId!)
        )
        .first();

      if (!connectedAccount) {
        return {
          status: ResponseStatus.SUCCESS,
          data: null,
        };
      }

      if (
        connectedAccount.status !== StripeAccountStatus.NOT_ONBOARDED &&
        connectedAccount.status !== StripeAccountStatus.VERIFIED
      ) {
        return {
          status: ResponseStatus.SUCCESS,
          data: null,
        };
      }
      return {
        status: ResponseStatus.SUCCESS,
        data: { connectedAccount },
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

export const internalGetConnectedAccountByClerkUserId = internalQuery({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args): Promise<ConnectedAccountsSchema> => {
    try {
      const user: UserSchema | null = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId)
        )
        .first();

      const validatedUser = validateUser(user, true, true);

      const connectedAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) =>
          q.eq("customerId", validatedUser.customerId!)
        )
        .first();

      const validatedConnectedAccount = validateConnectedAccount(
        connectedAccount,
        false
      );

      return validatedConnectedAccount;
    } catch (error) {
      console.error(error);
      throw new Error(ErrorMessages.CONNECTED_ACCOUNT_DB_QUERY_BY_CLERK);
    }
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

export const getConnectedAccountStatusBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetConnectedAccountStatusBySlugResponse> => {
    const { slug } = args;
    try {
      const organization: OrganizationSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      const validatedOrganization = validateOrganization(organization);

      const connectedAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) =>
          q.eq("customerId", validatedOrganization.customerId)
        )
        .first();

      const hasVerifiedConnectedAccount =
        !!connectedAccount &&
        connectedAccount.status === StripeAccountStatus.VERIFIED;

      return {
        status: ResponseStatus.SUCCESS,
        data: { hasVerifiedConnectedAccount },
      };
    } catch (error) {
      console.error("Error fetching connected account status:", error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: "An error occurred while checking the connected account status.",
      };
    }
  },
});

export const updateConnectedAccountByStripeId = internalMutation({
  args: { stripeAccountId: v.string(), status: StripeAccountStatusConvex },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      console.error("Error fetching connected account by Stripe ID:", error);
      throw new Error(ErrorMessages.CONNECTED_ACCOUNT_DB_UPDATE_BY_STRIPE);
    }
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }) => {
    try {
      const event = await verifyStripeConnectedWebhook(payload, signature);
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(ctx, event.data.object);
          const paymentIntent = event.data.object;
          console.log("✅ Payment successful:", paymentIntent);
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
