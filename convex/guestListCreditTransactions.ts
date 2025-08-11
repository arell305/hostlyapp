import { action, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { handleError } from "./backendUtils/helper";
import { requireAuthenticatedUser } from "../utils/auth";
import { ErrorMessages, ResponseStatus, UserRole } from "@/types/enums";
import { createPaymentIntent } from "./backendUtils/stripe";
import { CreateGuestListCreditPaymentIntentResponse } from "@/types/convex-types";
import { GUEST_LIST_CREDIT_PRICE } from "@/types/constants";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  validateOrganizationCredit,
  validateUser,
} from "./backendUtils/validation";

export const createGuestListCredit = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    amountPaid: v.number(),
    credits: v.number(),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"guestListCreditTransactions">> => {
    const {
      organizationId,
      userId,
      amountPaid,
      credits,
      stripePaymentIntentId,
    } = args;
    try {
      const guestListCreditTransactionId = await ctx.db.insert(
        "guestListCreditTransactions",
        {
          organizationId,
          userId,
          amountPaid,
          credits,
          stripePaymentIntentId,
          type: "added",
        }
      );

      const existing = await ctx.db
        .query("organizationCredits")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", organizationId)
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          totalCredits: existing.totalCredits + credits,
          lastUpdated: Date.now(),
        });
      } else {
        await ctx.db.insert("organizationCredits", {
          organizationId,
          totalCredits: credits,
          creditsUsed: 0,
          lastUpdated: Date.now(),
        });
      }

      return guestListCreditTransactionId;
    } catch (error) {
      console.error(
        ErrorMessages.GUEST_LIST_CREDIT_TRANSACTION_CREATE_ERROR,
        error
      );
      throw new Error(ErrorMessages.GUEST_LIST_CREDIT_TRANSACTION_CREATE_ERROR);
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

      const { customer, user } = await ctx.runQuery(
        internal.customers.findUserAndCustomerByClerkId,
        {
          clerkUserId,
        }
      );

      const result = await createPaymentIntent({
        amount,
        customer: customer.stripeCustomerId,
        metadata: {
          organizationId: user.organizationId as string,
          userId: user._id.toString(),
          credits: totalCredits.toString(),
          quantity: quantity.toString(),
          purchaseType: "guestlist_credit",
        },
        description: `${totalCredits} guestlist credits purchased`,
        receiptEmail: customer.email,
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

export const useGuestListCredit = internalMutation({
  args: {
    organizationId: v.id("organizations"),
    clerkUserId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<Id<"guestListCreditTransactions">> => {
    const { organizationId, clerkUserId, eventId } = args;
    try {
      const user = validateUser(
        await ctx.db
          .query("users")
          .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
          .unique()
      );

      const guestListCreditTransactionId = await ctx.db.insert(
        "guestListCreditTransactions",
        {
          organizationId,
          userId: user._id,
          credits: 1,
          type: "used",
          eventId,
        }
      );

      const existing = validateOrganizationCredit(
        await ctx.db
          .query("organizationCredits")
          .withIndex("by_organizationId", (q) =>
            q.eq("organizationId", organizationId)
          )
          .unique()
      );

      await ctx.db.patch(existing._id, {
        totalCredits: existing.totalCredits - 1,
        lastUpdated: Date.now(),
      });

      return guestListCreditTransactionId;
    } catch (error) {
      console.error(ErrorMessages.ORGANIZATION_CREDIT_DB_USE, error);
      throw new Error(ErrorMessages.ORGANIZATION_CREDIT_DB_USE);
    }
  },
});
