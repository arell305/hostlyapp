import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { handleError } from "./backendUtils/helper";
import { requireAuthenticatedUser } from "../utils/auth";
import { ResponseStatus, UserRole } from "@/types/enums";
import { createPaymentIntent } from "./backendUtils/stripe";
import {
  CreateGuestListCreditPaymentIntentResponse,
  CreateGuestListCreditResponse,
} from "@/types/convex-types";
import { GUEST_LIST_CREDIT_PRICE } from "@/types/constants";
import { internal } from "./_generated/api";

export const createGuestListCredit = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    amountPaid: v.number(),
    creditsAdded: v.number(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args): Promise<CreateGuestListCreditResponse> => {
    const {
      organizationId,
      userId,
      amountPaid,
      creditsAdded,
      stripePaymentIntentId,
    } = args;
    try {
      await requireAuthenticatedUser(ctx, [UserRole.Admin]);

      const guestListCreditId = await ctx.db.insert("guestListCredits", {
        organizationId,
        userId,
        amountPaid,
        creditsAdded,
        stripePaymentIntentId,
      });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListCreditId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const createGuestListCreditPaymentIntent = action({
  args: {
    quantity: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<CreateGuestListCreditPaymentIntentResponse> => {
    const { quantity } = args;

    const { amountInCents, creditsPerUnit } = GUEST_LIST_CREDIT_PRICE;

    const amount = amountInCents * quantity;
    const totalCredits = creditsPerUnit * quantity;

    try {
      const identity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
      const clerkUserId = identity.id as string;

      const user = await ctx.runQuery(
        internal.users.internalFindUserByClerkId,
        {
          clerkUserId,
        }
      );

      const result = await createPaymentIntent({
        amount,
        metadata: {
          organizationId: user.organizationId as string,
          userId: user._id,
          credits: totalCredits,
          quantity,
        },
      });

      if (result.success && result.paymentIntent.client_secret) {
        return {
          status: ResponseStatus.SUCCESS,
          data: {
            clientSecret: result.paymentIntent.client_secret,
          },
        };
      } else {
        return {
          status: ResponseStatus.ERROR,
          error: "Missing client secret from Stripe",
          data: null,
        };
      }
    } catch (error) {
      return handleError(error);
    }
  },
});
