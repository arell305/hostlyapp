import { ErrorMessages } from "@/types/enums";
import { stripe } from "./stripe";
import Stripe from "stripe";
import { GenericActionCtx } from "convex/server";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { getStripeAccountStatus } from "./stripeWebhooks";

// export async function createStripeConnectedAccount(
//   email: string,
//   companyName: string
// ) {
//   try {
//     const account = await stripe.accounts.create({
//       type: "express",
//       country: "US",
//       email,
//       business_profile: {
//         name: companyName,
//       },
//       capabilities: {
//         card_payments: { requested: true },
//         transfers: { requested: true },
//       },
//     });

//     return account;
//   } catch (error) {
//     console.error("Failed to create Stripe connected account:", error);
//     throw new Error(ErrorMessages.STRIPE_CONNECT_CREATE_ERROR);
//   }
// }

export async function createStripeOnboardingSession(
  stripeAccountId: string
): Promise<Stripe.Response<Stripe.AccountSession>> {
  try {
    const accountSession: Stripe.Response<Stripe.AccountSession> =
      await stripe.accountSessions.create({
        account: stripeAccountId,
        components: {
          account_onboarding: {
            enabled: true,
            features: { external_account_collection: true },
          },
          documents: { enabled: true },
          payouts: { enabled: true },
          payments: { enabled: true },
        },
      });

    return accountSession;
  } catch (error) {
    console.error("Failed to create Stripe onboarding session:", error);
    throw new Error(ErrorMessages.STRIPE_CONNECT_ONBOARDING_ERROR);
  }
}

export async function createStripeDashboardLoginLink(
  stripeAccountId: string
): Promise<string> {
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return loginLink.url;
  } catch (error) {
    console.error("Failed to create Stripe dashboard login link:", error);
    throw new Error(ErrorMessages.STRIPE_CONNECT_DASHBOARD_ERROR);
  }
}

export async function verifyStripeConnectedWebhook(
  payload: string,
  sig: string
): Promise<Stripe.Event> {
  const secret = process.env.STRIPE_CONNECTED_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Stripe connected account webhook secret is not configured!");
    throw new Error(ErrorMessages.ENV_NOT_SET_CONNECTED);
  }

  try {
    return await stripe.webhooks.constructEventAsync(payload, sig, secret);
  } catch (error) {
    console.error(" Webhook verification failed:", error);
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_VERIFICATION);
  }
}

export const handlePaymentIntentSucceeded = async (
  ctx: GenericActionCtx<any>,
  session: Stripe.PaymentIntent
) => {
  try {
    await ctx.runAction(api.tickets.insertTicketsSold, {
      eventId: session.metadata.eventId as Id<"events">,
      promoCode: session.metadata.promoCode || null,
      email: session.metadata.email,
      maleCount: Number(session.metadata.maleCount) || 0,
      femaleCount: Number(session.metadata.femaleCount) || 0,
      totalAmount: Number(session.amount) || 0,
      stripePaymentIntentId: session.id,
      organizationId: session.metadata.organizationId as Id<"organizations">,
    });
  } catch (error) {
    console.error("Error processing handle payment Intent:", error);
    throw new Error(ErrorMessages.CONNECTED_ACCOUNT_PAYMENT_INTENT_SUCCEEDED);
  }
};

export async function createStripeConnectedAccount({
  email,
  customerId,
}: {
  email: string;
  customerId: string;
}): Promise<Stripe.Account> {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      metadata: {
        customerId,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  } catch (error) {
    console.error(ErrorMessages.STRIPE_CONNECT_CREATE_ERROR, error);
    throw new Error(ErrorMessages.STRIPE_CONNECT_CREATE_ERROR);
  }
}

export const handleConnectedAccountUpdated = async (
  ctx: GenericActionCtx<any>,
  account: Stripe.Account
) => {
  try {
    console.log("handle connected account updated");
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
