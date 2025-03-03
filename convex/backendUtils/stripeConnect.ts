import { ErrorMessages } from "@/types/enums";
import { stripe } from "./stripe";
import Stripe from "stripe";

export async function createStripeConnectedAccount(
  email: string,
  companyName: string
) {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email,
      business_profile: {
        name: companyName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    return account;
  } catch (error) {
    console.error("Failed to create Stripe connected account:", error);
    throw new Error(ErrorMessages.STRIPE_CONNECT_CREATE_ERROR);
  }
}

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
