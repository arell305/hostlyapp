import { GenericActionCtx } from "convex/server";
import Stripe from "stripe";
import { internal } from "../_generated/api";
import {
  ErrorMessages,
  StripeAccountStatus,
  SubscriptionStatus,
} from "@/types/enums";
import { getPaymentMethodDetails } from "./stripe";
import { getSubscriptionTierFromPrice } from "../stripe";
import { Id } from "../_generated/dataModel";

export const handleInvoicePaymentSucceeded = async (
  ctx: GenericActionCtx<any>,
  invoice: Stripe.Invoice
) => {
  try {
    if (!invoice.subscription) {
      throw new Error(ErrorMessages.STRIPE_MISSING_ID);
    }

    if (invoice.billing_reason === "subscription_create") {
      return;
    }
    const stripeSubscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription.id;
    const periodStart = invoice.period_start * 1000;
    const periodEnd = invoice.period_end * 1000;

    await ctx.runMutation(
      internal.subscription.updateSubscriptionBySubscriptionId,
      {
        stripeSubscriptionId,
        updates: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          guestListEventsCount: 0,
        },
      }
    );
  } catch (error) {
    console.error("Error handling invoice.payment_succeeded:", error);
    throw new Error(ErrorMessages.STRIPE_INVOICE_PAYMENT_SUCCEEDED);
  }
};

export const handleSubscriptionUpdated = async (
  ctx: GenericActionCtx<any>,
  subscription: Stripe.Subscription
) => {
  try {
    if (!subscription.id) {
      throw new Error(ErrorMessages.STRIPE_MISSING_ID);
    }

    const priceId = subscription.items.data[0]?.price.id;
    let amount = subscription.items.data[0]?.price.unit_amount || 0;
    const subscriptionTier = getSubscriptionTierFromPrice(priceId);

    const discountPercentage = subscription.discount?.coupon?.percent_off;
    const stripePromoCodeId = subscription.discount?.coupon?.id;

    if (discountPercentage) {
      amount = (amount * (1 - discountPercentage / 100)) / 100;
    }

    const updates: Record<string, any> = {
      subscriptionStatus: subscription.status as SubscriptionStatus,
      subscriptionTier,
      priceId,
      discount: {
        stripePromoCodeId,
        discountPercentage,
      },
      amount,
    };

    if (subscription.current_period_start) {
      updates.currentPeriodStart = subscription.current_period_start * 1000;
    }

    if (subscription.current_period_end) {
      updates.currentPeriodEnd = subscription.current_period_end * 1000;
    }

    if (subscription.trial_end) {
      updates.trialEnd = subscription.trial_end * 1000;
    }

    if (subscription.cancel_at_period_end) {
      updates.subscriptionStatus = SubscriptionStatus.PENDING_CANCELLATION;
    } else {
      updates.subscriptionStatus = SubscriptionStatus.ACTIVE;
    }

    await ctx.runMutation(
      internal.subscription.updateSubscriptionBySubscriptionId,
      {
        stripeSubscriptionId: subscription.id,
        updates,
      }
    );
  } catch (error) {
    console.error(" Error handling subscription.updated:", error);
    throw new Error(ErrorMessages.STRIPE_SUBSCRIPTION_UPDATED);
  }
};

export const handleSubscriptionDeleted = async (
  ctx: GenericActionCtx<any>,
  subscription: Stripe.Subscription
) => {
  try {
    if (!subscription.id) {
      throw new Error(ErrorMessages.STRIPE_MISSING_ID);
    }

    const stripeSubscriptionId = subscription.id;

    await ctx.runMutation(internal.subscription.deleteSubscription, {
      stripeSubscriptionId,
    });
  } catch (error) {
    console.error("Error handling customer.subscription.deleted:", error);
    throw new Error(ErrorMessages.STRIPE_SUBSCRIPTION_DELETED);
  }
};

export const handleAccountUpdated = async (
  ctx: GenericActionCtx<any>,
  account: Stripe.Account
) => {
  try {
    console.log("account", account);
    const status = getStripeAccountStatus(account);

    ctx.runMutation(
      internal.connectedAccounts.updateConnectedAccountByStripeId,
      {
        stripeAccountId: account.id,
        status,
      }
    );
  } catch (error) {
    console.error("Error handling account.updated event:", error);
    throw new Error(ErrorMessages.STRIPE_ACCOUNT_UPDATED);
  }
};

export const getStripeAccountStatus = (
  account: Stripe.Account
): StripeAccountStatus => {
  const { charges_enabled, payouts_enabled, requirements } = account;

  if (charges_enabled && payouts_enabled) {
    return StripeAccountStatus.VERIFIED;
  }

  if (requirements?.currently_due && requirements.currently_due.length > 0) {
    return StripeAccountStatus.PENDING;
  }

  if (requirements?.disabled_reason === "rejected.other") {
    return StripeAccountStatus.REJECTED;
  }

  if (requirements?.disabled_reason) {
    return StripeAccountStatus.RESTRICTED;
  }

  if (!charges_enabled && !payouts_enabled) {
    return StripeAccountStatus.DISABLED;
  }

  return StripeAccountStatus.PENDING;
};

export const handleCustomerUpdated = async (
  ctx: GenericActionCtx<any>,
  event: Stripe.Event
) => {
  try {
    if (event.type !== "customer.updated") {
      console.warn(
        "Received unexpected event type in handleCustomerUpdated:",
        event.type
      );
      return;
    }

    const customer = event.data.object;
    const stripeCustomerId = customer.id;
    const paymentMethodId = customer.invoice_settings
      ?.default_payment_method as string | null;

    if (!paymentMethodId) {
      console.warn(
        `No default payment method found for customer ${stripeCustomerId}.`
      );
      return;
    }

    const { last4, cardBrand } = await getPaymentMethodDetails(paymentMethodId);
    await ctx.runMutation(internal.customers.updateCustomerByStripeCustomerId, {
      stripeCustomerId,
      paymentDetails: {
        paymentMethodId,
        last4,
        cardBrand,
      },
    });
  } catch (error) {
    console.error("Error handling customer updated event:", error);
    throw new Error(ErrorMessages.STRIPE_CUSOMTER_UPDATED);
  }
};

export const handleStripePaymentIntentSucceeded = async (
  ctx: GenericActionCtx<any>,
  paymentIntent: Stripe.PaymentIntent
) => {
  try {
    const metadata = paymentIntent.metadata;
    const organizationId = metadata.organizationId;
    const userId = metadata.userId;
    const credits = metadata.credits;
    const amountPaid = paymentIntent.amount;
    const stripePaymentIntentId = paymentIntent.id;

    await ctx.runMutation(
      internal.guestListCreditTransactions.createGuestListCredit,
      {
        organizationId: organizationId as Id<"organizations">,
        userId: userId as Id<"users">,
        credits: parseInt(credits),
        amountPaid,
        stripePaymentIntentId,
      }
    );
  } catch (error) {
    console.error("Error handling payment intent succeeded event:", error);
    throw new Error(ErrorMessages.STRIPE_PAYMENT_INTENT_SUCCEEDED);
  }
};
