"use node";

import { action, internalAction } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { SubscriptionTierTypeConvex } from "./schema";
import {
  ErrorMessages,
  ShowErrorMessages,
  ResponseStatus,
  SubscriptionStatus,
  UserRole,
} from "@/shared/types/enums";
import {
  GetOnboardingLinkResponse,
  GetProratedPricesResponse,
  ValidatePromoCodeResponse,
  DisconnectStripeActionResponse,
  WebhookResponse,
} from "@/shared/types/convex-types";
import { USD_CURRENCY } from "@/shared/types/constants";
import { sendClerkInvitation } from "../shared/utils/clerk";
import {
  attachPaymentMethod,
  createStripeCustomer,
  createSubscription,
  getLatestUnpaidInvoice,
  getPaymentMethodDetails,
  getProratedPricesForAllTiers,
  payUnpaidInvoice,
  setDefaultPaymentMethod,
  stripe,
  updateSubscriptionTierInStripe,
  verifyStripeWebhook,
} from "./functions/stripe";
import { requireAuthenticatedUser } from "../shared/utils/auth";
import {
  validateCustomer,
  validateSubscription,
  validateUser,
} from "./backendUtils/validation";
import {
  createStripeConnectedAccount,
  createStripeDashboardLoginLink,
  createStripeOnboardingSession,
} from "./functions/stripeConnect";
import { deactivateStripeConnectedAccount } from "./connectedAccounts";
import { handleError, validateTicketAvailability } from "./backendUtils/helper";
import {
  handleAccountUpdated,
  handleCustomerUpdated,
  handleInvoicePaymentSucceeded,
  handleStripePaymentIntentSucceeded,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "./webhooks/stripeWebhooks";
import { Id } from "./_generated/dataModel";
import Stripe from "stripe";
import { APPLICATION_FEE } from "@/app/types/constants";
import { SubscriptionTierType } from "@/shared/types/types";

export const validatePromoCode = action({
  args: { promoCode: v.string() },
  handler: async (ctx, args): Promise<ValidatePromoCodeResponse> => {
    try {
      const promotionCodes = await stripe.promotionCodes.list({
        code: args.promoCode,
        active: true,
        limit: 1,
      });

      if (promotionCodes.data.length === 0) {
        return { isValid: false, approvedPromoCode: null, discount: null };
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
          discount = coupon.amount_off / 100;
        }

        return {
          isValid: true,
          approvedPromoCode: args.promoCode,
          discount: discount,
        };
      }
      return { isValid: false, approvedPromoCode: null, discount: null };
    } catch (error) {
      console.error("Error validating promo code:", error);
      return { isValid: false, approvedPromoCode: null, discount: null };
    }
  },
});

export const createStripeSubscription = action({
  args: {
    email: v.string(),
    paymentMethodId: v.string(),
    promoCode: v.optional(v.union(v.string(), v.null())),
    subscriptionTier: SubscriptionTierTypeConvex,
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const {
      email,
      paymentMethodId,
      promoCode,
      subscriptionTier,
      idempotencyKey,
    } = args;

    try {
      const existingUser = await ctx.runQuery(internal.users.findUserByEmail, {
        email,
      });

      if (existingUser && !existingUser.customerId) {
        throw new ConvexError({
          message: ErrorMessages.CUSTOMER_EXISTING_USER,
          code: "CONFLICT",
        });
      }

      const existingCustomer = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        {
          email: args.email,
        }
      );

      if (existingCustomer) {
        throw new Error(ShowErrorMessages.CUSTOMER_EXISTS);
      }

      const customer = await createStripeCustomer(email);
      const stripeCustomerId = customer.id;

      const paymentMethod = await attachPaymentMethod(
        paymentMethodId,
        stripeCustomerId
      );

      await setDefaultPaymentMethod(stripeCustomerId, paymentMethod.id);

      const { last4, cardBrand } =
        await getPaymentMethodDetails(paymentMethodId);

      let trialPeriodDays: number | undefined = undefined;
      if (!existingCustomer && subscriptionTier !== "Elite") {
        trialPeriodDays = 30;
      }

      const priceId = getPriceIdForTier(subscriptionTier);

      let promoCodeId: string | null = null;
      if (promoCode) {
        const promotionCodes = await stripe.promotionCodes.list({
          code: promoCode,
          active: true,
          limit: 1,
        });

        if (promotionCodes.data.length === 0) {
          throw new Error(ShowErrorMessages.INVALID_PROMO_CODE);
        }

        promoCodeId = promotionCodes.data[0].id;
      }

      const subscription = await createSubscription(
        stripeCustomerId,
        priceId,
        idempotencyKey,
        trialPeriodDays,
        promoCodeId
      );

      const baseAmount = subscription.items.data[0]?.price.unit_amount || 0;

      await sendClerkInvitation(args.email);

      const customerId = await ctx.runMutation(
        internal.customers.createCustomer,
        {
          stripeCustomerId,
          email,
          paymentMethodId,
          last4,
          cardBrand,
        }
      );

      const subscriptionId = await ctx.runMutation(
        internal.subscription.insertSubscription,
        {
          stripeSubscriptionId: subscription.id,
          priceId,
          trialEnd: subscription.trial_end,
          currentPeriodEnd: subscription.current_period_end * 1000,
          stripeBillingCycleAnchor: subscription.billing_cycle_anchor * 1000,
          subscriptionStatus: subscription.status as SubscriptionStatus,
          subscriptionTier,
          customerId,
          currentPeriodStart: subscription.current_period_start * 1000,
          amount: baseAmount,
          discount: promoCodeId
            ? {
                stripePromoCodeId: promoCodeId,
                discountPercentage:
                  subscription.discount?.coupon?.percent_off || 0,
              }
            : undefined,
        }
      );
      return true;
    } catch (error) {
      console.error("Error creating stripe subscription:", error);
      throw new ConvexError({
        message: ErrorMessages.INTERNAL_ERROR,
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  },
});

function getPriceIdForTier(tier: SubscriptionTierType): string {
  const priceId = (() => {
    switch (tier) {
      case "Standard":
        return process.env.PRICE_ID_STANDARD;
      case "Plus":
        return process.env.PRICE_ID_PLUS;
      case "Elite":
        return process.env.PRICE_ID_ELITE;
      default:
        throw new Error(`Invalid subscription tier: ${tier}`);
    }
  })();

  if (!priceId) {
    throw new Error(`Missing environment variable for tier: ${tier}`);
  }

  return priceId;
}

export function getSubscriptionTierFromPrice(
  priceId: string
): SubscriptionTierType {
  switch (priceId) {
    case process.env.PRICE_ID_STANDARD:
      return "Standard";
    case process.env.PRICE_ID_PLUS:
      return "Plus";
    case process.env.PRICE_ID_ELITE:
      return "Elite";
    default:
      throw new Error(`Unknown priceId: ${priceId}`);
  }
}

// stripe connect

export const createConnectedAccount = action({
  args: {},
  handler: async (ctx, args): Promise<Id<"connectedAccounts">> => {
    const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
    const clerkUserId = idenitity.id as string;

    const customer = await ctx.runQuery(
      internal.customers.findCustomerWithCompanyNameByClerkId,
      {
        clerkUserId,
      }
    );

    const account = await createStripeConnectedAccount({
      email: customer.email,
      customerId: customer._id,
    });

    const connectedAccountId = await ctx.runMutation(
      internal.connectedAccounts.saveConnectedAccount,
      {
        customerId: customer._id,
        stripeAccountId: account.id,
        status: "Not Onboarded Yet",
      }
    );

    return connectedAccountId;
  },
});

export const getOnboardingLink = action({
  args: {},
  handler: async (ctx): Promise<GetOnboardingLinkResponse> => {
    const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
    const clerkUserId = idenitity.id as string;

    const connectedAccount = await ctx.runQuery(
      internal.connectedAccounts.internalGetConnectedAccountByClerkUserId,
      {
        clerkUserId,
      }
    );

    const accountSession = await createStripeOnboardingSession(
      connectedAccount.stripeAccountId
    );

    return {
      status: ResponseStatus.SUCCESS,
      data: { client_secret: accountSession.client_secret },
    };
  },
});

export const getStripeDashboardUrl = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
    const clerkUserId = idenitity.id as string;

    const connectedAccount = await ctx.runQuery(
      internal.connectedAccounts.internalGetConnectedAccountByClerkUserId,
      {
        clerkUserId,
      }
    );

    return await createStripeDashboardLoginLink(
      connectedAccount.stripeAccountId
    );
  },
});

export const disconnectStripeAccount = action({
  args: {},
  handler: async (ctx): Promise<DisconnectStripeActionResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
      const clerkUserId = idenitity.id as string;

      const connectedAccount = await ctx.runQuery(
        internal.connectedAccounts.internalGetConnectedAccountByClerkUserId,
        {
          clerkUserId,
        }
      );

      await Promise.all([
        deactivateStripeConnectedAccount(connectedAccount.stripeAccountId),
        ctx.runMutation(internal.connectedAccounts.deleteConnectedAccount, {
          connectedAccountId: connectedAccount._id,
        }),
      ]);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          connectedAccountId: connectedAccount._id,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getStripeCustomerIdForEmail = action({
  args: { email: v.string(), stripeAccountId: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const { email, stripeAccountId } = args;
    const existingCustomer = await ctx.runQuery(
      internal.stripeConnectedCustomers.getStripeConnectedCustomerByEmail,
      {
        email,
      }
    );
    if (existingCustomer) {
      return existingCustomer.stripeCustomerId;
    }

    const { data: stripeCustomers } = await stripe.customers.search(
      { query: `email:'${email}'` },
      { stripeAccount: stripeAccountId }
    );

    if (stripeCustomers.length > 0) {
      const stripeCustomerId = stripeCustomers[0].id;

      // 3️⃣ Save found customer in database
      await ctx.runMutation(
        internal.stripeConnectedCustomers.insertStripeConnectedCustomer,
        {
          email,
          stripeCustomerId,
          stripeAccountId,
        }
      );

      return stripeCustomerId;
    }

    // 4️⃣ If not found in Stripe, create new customer
    const newCustomer = await stripe.customers.create(
      {
        email,
        metadata: { stripeAccountId },
      },
      { stripeAccount: stripeAccountId }
    );

    // 5️⃣ Save new customer in database
    await ctx.runMutation(
      internal.stripeConnectedCustomers.insertStripeConnectedCustomer,
      {
        email,
        stripeCustomerId: newCustomer.id,
        stripeAccountId,
      }
    );

    return newCustomer.id;
  },
});

export const createPaymentIntent = action({
  args: {
    totalAmount: v.number(),
    stripeAccountId: v.string(),
    metadata: v.optional(
      v.object({
        eventId: v.string(),
        promoCode: v.optional(v.string()),
        email: v.string(),
        organizationId: v.string(),
        ticketTypes: v.array(
          v.object({
            eventTicketTypeId: v.string(),
            quantity: v.number(),
          })
        ),
      })
    ),
    description: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const { totalAmount, stripeAccountId, metadata, description } = args;

    try {
      // Validate ticket availability
      await validateTicketAvailability({
        ctx,
        eventId: metadata?.eventId as Id<"events">,
        requestedTicketTypes:
          metadata?.ticketTypes.map((t) => ({
            eventTicketTypeId: t.eventTicketTypeId as Id<"eventTicketTypes">,
            quantity: t.quantity,
          })) ?? [],
      });

      // Flatten metadata for Stripe
      const flatMetadata: Record<string, string> = {
        eventId: metadata?.eventId ?? "",
        email: metadata?.email ?? "",
        organizationId: metadata?.organizationId ?? "",
      };

      if (metadata?.promoCode) {
        flatMetadata.promoCode = metadata.promoCode;
      }

      if (metadata?.ticketTypes) {
        flatMetadata.ticketCounts = JSON.stringify(metadata.ticketTypes);
      }

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(totalAmount * 100),
          currency: USD_CURRENCY,
          automatic_payment_methods: { enabled: true },
          metadata: flatMetadata,
          description,
          receipt_email: metadata?.email,
          application_fee_amount: APPLICATION_FEE,
        },
        { stripeAccount: stripeAccountId }
      );

      if (!paymentIntent.client_secret) {
        throw new Error(ErrorMessages.PAYMENT_INTENT_FAILED);
      }

      return paymentIntent.client_secret;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw new Error(ErrorMessages.PAYMENT_INTENT_FAILED);
    }
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }): Promise<WebhookResponse> => {
    try {
      console.log("incoming webhook");
      const event = await verifyStripeWebhook(payload, signature);
      console.log("event", event);
      switch (event.type) {
        case "invoice.payment_succeeded":
          await handleInvoicePaymentSucceeded(ctx, event.data.object);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(ctx, event.data.object);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(ctx, event.data.object);
          break;
        case "customer.updated":
          await handleCustomerUpdated(ctx, event);
          break;
        case "account.updated":
          await handleAccountUpdated(ctx, event.data.object);
          break;
        case "payment_intent.succeeded": {
          const pi = event.data.object as Stripe.PaymentIntent;
          if (pi.metadata?.purchaseType === "guestlist_credit") {
            await handleStripePaymentIntentSucceeded(ctx, pi);
          }
          break;
        }

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

export const retryInvoicePayment = action({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);

      const customer = validateCustomer(
        await ctx.runQuery(internal.customers.findCustomerByEmail, {
          email: identity.email as string,
        })
      );

      const invoice = await getLatestUnpaidInvoice(customer.stripeCustomerId);
      if (!invoice) {
        throw new Error(ErrorMessages.NO_UNPAID_INVOICE);
      }

      const paidInvoice = await payUnpaidInvoice(invoice.id);
      if (!paidInvoice) {
        throw new Error(ErrorMessages.INVOICE_PAYMENT_FAILED);
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          invoiceId: paidInvoice.id,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getProratedPrices = action({
  args: {},
  handler: async (ctx, args): Promise<GetProratedPricesResponse> => {
    try {
      const identity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);

      const customer = validateCustomer(
        await ctx.runQuery(internal.customers.findCustomerByEmail, {
          email: identity.email as string,
        })
      );

      const subscription = validateSubscription(
        await ctx.runQuery(
          internal.subscription.getUsableSubscriptionByCustomerId,
          {
            customerId: customer._id,
          }
        )
      );

      const proratedPrices = await getProratedPricesForAllTiers(
        subscription.stripeSubscriptionId,
        customer.stripeCustomerId,
        subscription.discount?.stripePromoCodeId
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: { proratedPrices },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const createStripeOnboardingLink = action({
  args: { origin: v.string() },
  handler: async (ctx, { origin }): Promise<string> => {
    const identity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
    const email = identity.email as string;

    const user = validateUser(
      await ctx.runQuery(internal.users.findUserByEmail, {
        email,
      }),
      true,
      true,
      true
    );

    const existingAccount = await ctx.runQuery(
      internal.connectedAccounts.getConnectedAccountByCustomerId,
      {
        customerId: user.customerId,
      }
    );

    let stripeAccountId = existingAccount?.stripeAccountId;

    if (!stripeAccountId) {
      const account = await createStripeConnectedAccount({
        email: user.email,
        customerId: user.customerId!,
      });

      stripeAccountId = account.id;

      ctx.runMutation(internal.connectedAccounts.saveConnectedAccount, {
        customerId: user.customerId!,
        stripeAccountId: account.id,
        status: "Not Onboarded Yet",
      });
    }

    const url = await generateStripeAccountLink({
      accountId: stripeAccountId,
      type: "account_onboarding",
      returnUrl: origin,
      refreshUrl: origin,
    });

    return url;
  },
});

type StripeAccountLinkType = "account_onboarding" | "account_update";

export async function generateStripeAccountLink({
  accountId,
  type = "account_onboarding",
  returnUrl,
  refreshUrl,
}: {
  accountId: string;
  type?: StripeAccountLinkType;
  returnUrl: string;
  refreshUrl: string;
}): Promise<string> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type,
    });

    return accountLink.url;
  } catch (error) {
    console.error(ErrorMessages.STRIPE_CONNECTED_ONBOARDING_LINK, error);
    throw new Error(ErrorMessages.STRIPE_CONNECTED_ONBOARDING_LINK);
  }
}
