"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { StripeAccountStatus } from "@/types/enums";
import { SubscriptionTierConvex } from "./schema";
import {
  ErrorMessages,
  ShowErrorMessages,
  ResponseStatus,
  SubscriptionStatus,
  SubscriptionTier,
  UserRole,
} from "@/types/enums";
import {
  CreateConnectedAccountResponse,
  CreateStripeSubscriptionResponse,
  GetOnboardingLinkResponse,
  GetProratedPricesResponse,
  GetStripeDashboardUrlResponse,
  UpdateStripeSubscriptionResponse,
  UpdateSubscriptionPaymentMethodResponse,
  UpdateSubscriptionTierResponse,
  ValidatePromoCodeResponse,
  DisconnectStripeActionResponse,
  CreatePaymentIntentResponse,
  WebhookResponse,
  CreateStripeOnboardingLinkResponse,
} from "@/types/convex-types";
import { USD_CURRENCY } from "@/types/constants";
import { sendClerkInvitation } from "../utils/clerk";
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
  updateStripePaymentMethodHelper,
  updateSubscriptionTierInStripe,
  verifyStripeWebhook,
} from "./backendUtils/stripe";
import { requireAuthenticatedUser } from "../utils/auth";
import { CustomerSchema, UserSchema } from "@/types/schemas-types";
import {
  validateCustomer,
  validateOrganization,
  validateSubscription,
  validateUser,
} from "./backendUtils/validation";
import {
  createStripeConnectedAccount,
  createStripeDashboardLoginLink,
  createStripeOnboardingSession,
} from "./backendUtils/stripeConnect";
import { deactivateStripeConnectedAccount } from "./connectedAccounts";
import {
  getTicketSoldCounts,
  handleError,
  validateTicketAvailability,
} from "./backendUtils/helper";
import {
  handleAccountUpdated,
  handleCustomerUpdated,
  handleInvoicePaymentSucceeded,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from "./backendUtils/stripeWebhooks";
import { Id } from "./_generated/dataModel";

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
          discount = coupon.amount_off / 100;
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
    subscriptionTier: SubscriptionTierConvex,
  },
  handler: async (ctx, args): Promise<CreateStripeSubscriptionResponse> => {
    const { email, paymentMethodId, priceId, promoCodeId, subscriptionTier } =
      args;

    try {
      const existingUser: UserSchema | null = await ctx.runQuery(
        internal.users.findUserByEmail,
        {
          email,
        }
      );

      if (existingUser && !existingUser.customerId) {
        throw new Error(ErrorMessages.CUSTOMER_EXISTING_USER);
      }

      const existingCustomer: CustomerSchema | null = await ctx.runQuery(
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
      if (!existingCustomer && subscriptionTier !== SubscriptionTier.ELITE) {
        trialPeriodDays = 30;
      }

      const subscription = await createSubscription(
        stripeCustomerId,
        priceId,
        trialPeriodDays,
        promoCodeId
      );

      const baseAmount = subscription.items.data[0]?.price.unit_amount || 0;
      const discountPercentage =
        subscription.discount?.coupon?.percent_off || 0;
      const subscriptionAmount =
        (baseAmount * (1 - discountPercentage / 100)) / 100;

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
          amount: subscriptionAmount,
          discount: promoCodeId
            ? {
                stripePromoCodeId: promoCodeId,
                discountPercentage,
              }
            : undefined,
        }
      );
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerId,
          subscriptionId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const updateSubscriptionPaymentMethod = action({
  args: {
    newPaymentMethodId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<UpdateSubscriptionPaymentMethodResponse> => {
    const { newPaymentMethodId } = args;
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);

      const customer: CustomerSchema | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: idenitity.email as string }
      );

      const validatedCustomer = validateCustomer(customer);

      const subscription = validateSubscription(
        await ctx.runQuery(
          internal.subscription.getUsableSubscriptionByCustomerId,
          {
            customerId: validatedCustomer._id,
          }
        )
      );

      await Promise.all([
        updateStripePaymentMethodHelper(
          stripe,
          validatedCustomer.stripeCustomerId,
          newPaymentMethodId,
          subscription.stripeSubscriptionId
        ),
        ctx.runMutation(internal.customers.updateCustomer, {
          id: validatedCustomer._id,
          updates: {
            paymentMethodId: newPaymentMethodId,
          },
        }),
      ]);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerId: validatedCustomer._id,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const updateSubscriptionTier = action({
  args: {
    newTier: v.union(
      v.literal(SubscriptionTier.STANDARD),
      v.literal(SubscriptionTier.PLUS),
      v.literal(SubscriptionTier.ELITE)
    ),
  },
  handler: async (ctx, args): Promise<UpdateSubscriptionTierResponse> => {
    const { newTier } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);

      const customer: CustomerSchema | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        { email: identity.email as string }
      );

      const validatedCustomer = validateCustomer(customer);

      const newPriceId = getPriceIdForTier(newTier);

      const subscription = validateSubscription(
        await ctx.runQuery(
          internal.subscription.getUsableSubscriptionByCustomerId,
          {
            customerId: validatedCustomer._id,
          }
        )
      );

      await updateSubscriptionTierInStripe(
        subscription.stripeSubscriptionId,
        newPriceId
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerId: validatedCustomer._id,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

type CalculateSubscriptionUpdateResult = {
  success: boolean;
  proratedAmount?: number;
  newMonthlyRate?: number;
  message?: string;
};

export const calculateAllSubscriptionUpdates = action({
  args: {
    email: v.string(),
    currentTier: v.union(
      v.literal(SubscriptionTier.STANDARD),
      v.literal(SubscriptionTier.PLUS),
      v.literal(SubscriptionTier.ELITE)
    ),
    percentageDiscount: v.optional(v.number()),
  },
  handler: async (
    ctx,
    args
  ): Promise<Record<SubscriptionTier, CalculateSubscriptionUpdateResult>> => {
    const { email, currentTier, percentageDiscount } = args;
    const results: Record<SubscriptionTier, CalculateSubscriptionUpdateResult> =
      {
        [SubscriptionTier.STANDARD]: {
          success: false,
          message: "Not calculated",
        },
        [SubscriptionTier.PLUS]: { success: false, message: "Not calculated" },
        [SubscriptionTier.ELITE]: { success: false, message: "Not calculated" },
      };

    try {
      // const customer = await ctx.runQuery(
      //   internal.customers.findCustomerByEmail,
      //   { email }
      // );
      // if (
      //   !customer ||
      //   !customer.stripeCustomerId ||
      //   !customer.stripeSubscriptionId
      // ) {
      //   throw new Error("Customer or subscription not found");
      // }

      // const subscription = await stripe.subscriptions.retrieve(
      //   customer.stripeSubscriptionId
      // );

      // for (const tier of Object.values(SubscriptionTier)) {
      //   if (tier !== currentTier) {
      //     const newPriceId = getPriceIdForTier(tier);
      //     const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      //       customer: customer.stripeCustomerId,
      //       subscription: customer.stripeSubscriptionId,
      //       subscription_items: [
      //         {
      //           id: subscription.items.data[0].id,
      //           price: newPriceId,
      //         },
      //       ],
      //       subscription_proration_date: Math.floor(Date.now() / 1000),
      //     });

      //     let minusAmount = subscription.items.data[0].price.unit_amount ?? 0;

      //     let newMonthlyRate =
      //       upcomingInvoice.lines.data.find(
      //         (line) => line.price?.id === newPriceId
      //       )?.amount ?? 0;

      //     // Apply discount if provided
      //     if (percentageDiscount) {
      //       // Calculate discounted amounts
      //       const discountFactor = 1 - percentageDiscount / 100;
      //       // proratedAmount *= discountFactor; // Apply discount to prorated amount
      //       newMonthlyRate *= discountFactor;
      //       minusAmount *= discountFactor; // Apply discount to new monthly rate
      //     }
      //     let proratedAmount = upcomingInvoice.amount_due - minusAmount;
      //     proratedAmount = Math.max(0, proratedAmount); // Ensure it's not negative

      //     results[tier] = {
      //       success: true,
      //       proratedAmount: Math.max(0, proratedAmount / 100), // Ensure final values are non-negative
      //       newMonthlyRate: Math.max(0, newMonthlyRate / 100),
      //     };
      //   }
      // }

      return results;
    } catch (error) {
      console.error("Error calculating subscription updates:", error);
      return Object.fromEntries(
        Object.values(SubscriptionTier).map((tier) => [
          tier,
          {
            success: false,
            message: "Failed to calculate subscription update",
          },
        ])
      ) as Record<SubscriptionTier, CalculateSubscriptionUpdateResult>;
    }
  },
});
function getPriceIdForTier(tier: SubscriptionTier): string {
  switch (tier) {
    case SubscriptionTier.STANDARD:
      return process.env.PRICE_ID_STANDARD as string;
    case SubscriptionTier.PLUS:
      return process.env.PRICE_ID_PLUS as string;
    case SubscriptionTier.ELITE:
      return process.env.PRICE_ID_ELITE as string;
    default:
      throw new Error("Invalid subscription tier");
  }
}

export function getSubscriptionTierFromPrice(
  priceId: string
): SubscriptionTier {
  switch (priceId) {
    case process.env.PRICE_ID_STANDARD:
      return SubscriptionTier.STANDARD;
    case process.env.PRICE_ID_PLUS:
      return SubscriptionTier.PLUS;
    case process.env.PRICE_ID_ELITE:
      return SubscriptionTier.ELITE;
    default:
      throw new Error(`Unknown priceId: ${priceId}`);
  }
}

// stripe connect

export const createConnectedAccount = action({
  args: {},
  handler: async (ctx, args): Promise<CreateConnectedAccountResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
      const clerkUserId = idenitity.id as string;

      const customer = await ctx.runQuery(
        internal.customers.findCustomerWithCompanyNameByClerkId,
        {
          clerkUserId,
        }
      );

      const account = await createStripeConnectedAccount(
        customer.email,
        customer.companyName
      );

      const connectedAccountId = await ctx.runMutation(
        internal.connectedAccounts.saveConnectedAccount,
        {
          customerId: customer._id,
          stripeAccountId: account.id,
          status: StripeAccountStatus.NOT_ONBOARDED,
        }
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          connectedAccountId,
        },
      };
    } catch (error) {
      return handleError(error);
    }
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
  handler: async (ctx): Promise<GetStripeDashboardUrlResponse> => {
    try {
      const idenitity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
      const clerkUserId = idenitity.id as string;

      const connectedAccount = await ctx.runQuery(
        internal.connectedAccounts.internalGetConnectedAccountByClerkUserId,
        {
          clerkUserId,
        }
      );

      const url = await createStripeDashboardLoginLink(
        connectedAccount.stripeAccountId
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          url,
        },
      };
    } catch (error) {
      return handleError(error);
    }
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
        maleCount: v.number(),
        femaleCount: v.number(),
      })
    ),
  },
  handler: async (ctx, args): Promise<CreatePaymentIntentResponse> => {
    const { totalAmount, stripeAccountId, metadata } = args;

    try {
      validateTicketAvailability({
        ctx,
        eventId: metadata?.eventId as Id<"events">,
        requestedMaleCount: metadata?.maleCount as number,
        requestedFemaleCount: metadata?.femaleCount as number,
      });

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(totalAmount * 100),
          currency: USD_CURRENCY,
          automatic_payment_methods: { enabled: true },
          metadata: metadata,
        },
        { stripeAccount: stripeAccountId }
      );

      if (!paymentIntent.client_secret) {
        throw new Error(ErrorMessages.PAYMENT_INTENT_FAILED);
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: { clientSecret: paymentIntent.client_secret },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }): Promise<WebhookResponse> => {
    try {
      const event = await verifyStripeWebhook(payload, signature);
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
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
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

export const reactivateStripeSubscription = action({
  args: {
    paymentMethodId: v.string(),
    priceId: v.string(),
    promoCodeId: v.optional(v.union(v.string(), v.null())),
    subscriptionTier: SubscriptionTierConvex,
  },
  handler: async (ctx, args): Promise<UpdateStripeSubscriptionResponse> => {
    const { paymentMethodId, priceId, promoCodeId, subscriptionTier } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [UserRole.Admin]);
      const email = identity.email as string;
      const clerkOrganizationId = identity.clerk_org_id as string;

      const customer = validateCustomer(
        await ctx.runQuery(internal.customers.findCustomerByEmail, {
          email,
        }),
        false
      );

      const existingSubscription = await ctx.runQuery(
        internal.subscription.getSubscriptionByCustomerId,
        { customerId: customer._id }
      );

      if (
        existingSubscription &&
        existingSubscription.subscriptionStatus !== SubscriptionStatus.CANCELED
      ) {
        throw new Error(ShowErrorMessages.SUBSCRIPTION_ACTIVE);
      }

      const paymentMethod = await attachPaymentMethod(
        paymentMethodId,
        customer.stripeCustomerId
      );

      await setDefaultPaymentMethod(
        customer.stripeCustomerId,
        paymentMethod.id
      );

      const { last4, cardBrand } =
        await getPaymentMethodDetails(paymentMethodId);

      const trialPeriodDays: number = 0;

      const subscription = await createSubscription(
        customer.stripeCustomerId,
        priceId,
        trialPeriodDays,
        promoCodeId
      );

      const baseAmount = subscription.items.data[0]?.price.unit_amount || 0;
      const discountPercentage =
        subscription.discount?.coupon?.percent_off || 0;
      const subscriptionAmount =
        (baseAmount * (1 - discountPercentage / 100)) / 100;

      const [_, subscriptionId] = await Promise.all([
        ctx.runMutation(internal.customers.updateCustomer, {
          id: customer._id,
          updates: {
            paymentMethodId,
            isActive: true,
            last4,
            cardBrand,
          },
        }),
        ctx.runMutation(internal.subscription.insertSubscription, {
          stripeSubscriptionId: subscription.id,
          priceId,
          trialEnd: null,
          currentPeriodEnd: subscription.current_period_end * 1000,
          stripeBillingCycleAnchor: subscription.billing_cycle_anchor * 1000,
          subscriptionStatus: subscription.status as SubscriptionStatus,
          subscriptionTier,
          customerId: customer._id,
          currentPeriodStart: subscription.current_period_start * 1000,
          amount: subscriptionAmount,
          discount: promoCodeId
            ? {
                stripePromoCodeId: promoCodeId,
                discountPercentage,
              }
            : undefined,
        }),
      ]);

      const organization = validateOrganization(
        await ctx.runQuery(
          internal.organizations.internalGetOrganizationByClerkId,
          {
            clerkOrganizationId,
          }
        ),
        false
      );

      await ctx.runMutation(internal.organizations.updateOrganization, {
        clerkOrganizationId,
        isActive: true,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          customerId: customer._id,
          subscriptionId,
          organization: organization,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const createStripeOnboardingLink = action({
  args: { origin: v.string() },
  handler: async (
    ctx,
    { origin }
  ): Promise<CreateStripeOnboardingLinkResponse> => {
    try {
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
          status: StripeAccountStatus.NOT_ONBOARDED,
        });
      }

      const url = await generateStripeAccountLink({
        accountId: stripeAccountId,
        type: "account_onboarding",
        returnUrl: origin,
        refreshUrl: origin,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          url,
        },
      };
    } catch (error) {
      return handleError(error);
    }
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
