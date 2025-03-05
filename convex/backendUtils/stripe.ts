import { STRIPE_API_VERSION } from "@/types/constants";
import { ErrorMessages } from "@/types/enums";
import { CustomerSchema } from "@/types/schemas-types";
import { CustomerWithPayment } from "@/types/types";
import { DateTime } from "luxon";
import Stripe from "stripe";

if (!process.env.STRIPE_KEY) {
  throw new Error(ErrorMessages.ENV_NOT_SET_STRIPE_KEY);
}
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

export const fetchCustomerPaymentDetails = async (
  customer: CustomerSchema
): Promise<CustomerWithPayment> => {
  try {
    const paymentMethods: Stripe.Response<
      Stripe.ApiList<Stripe.PaymentMethod>
    > = await stripe.paymentMethods.list({
      customer: customer.stripeCustomerId,
      type: "card",
    });

    const defaultPaymentMethod: Stripe.PaymentMethod | undefined =
      paymentMethods.data[0];

    const subscription: Stripe.Response<Stripe.Subscription> =
      await stripe.subscriptions.retrieve(customer.stripeSubscriptionId);
    const currentPrice = subscription.items.data[0].price;
    const amount = currentPrice?.unit_amount ?? 0; // Amount in cents

    let discountPercentage = 0;
    if (subscription.discount) {
      discountPercentage = subscription.discount.coupon?.percent_off ?? 0;
    }

    return {
      ...customer, // Spread existing customer properties
      brand: defaultPaymentMethod?.card?.brand,
      last4: defaultPaymentMethod?.card?.last4,
      currentSubscriptionAmount: amount / 100, // Convert cents to dollars
      discountPercentage,
    };
  } catch (error) {
    console.error(ErrorMessages.STRIPE_QUERY_PAYMENT_ERROR, error);
    throw new Error(ErrorMessages.STRIPE_QUERY_PAYMENT_ERROR);
  }
};

export async function cancelStripeSubscriptionAtPeriodEnd(
  stripeSubscriptionId: string
): Promise<Stripe.Response<Stripe.Subscription>> {
  try {
    const updatedSubscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    return updatedSubscription;
  } catch (error) {
    console.error(ErrorMessages.STRIPE_CANCEL_PERIOD_END_ERROR, error);
    throw new Error(ErrorMessages.STRIPE_CANCEL_PERIOD_END_ERROR);
  }
}

export async function resumeStripeSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Response<Stripe.Subscription>> {
  try {
    const updatedSubscription: Stripe.Response<Stripe.Subscription> =
      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

    return updatedSubscription;
  } catch (error) {
    console.error(ErrorMessages.STRIPE_RESUME_ERROR, error);
    throw new Error(ErrorMessages.STRIPE_RESUME_ERROR);
  }
}

export async function updateStripePaymentMethodHelper(
  stripe: Stripe,
  stripeCustomerId: string,
  newPaymentMethodId: string,
  stripeSubscriptionId: string
): Promise<void> {
  try {
    await stripe.paymentMethods.attach(newPaymentMethodId, {
      customer: stripeCustomerId,
    });
    await Promise.all([
      stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: newPaymentMethodId,
        },
      }),
      stripe.subscriptions.update(stripeSubscriptionId, {
        default_payment_method: newPaymentMethodId,
      }),
    ]);
  } catch (error: any) {
    console.error(ErrorMessages.STRIPE_UPDATE_PAYMENT_ERROR, error);
    throw new Error(ErrorMessages.STRIPE_UPDATE_PAYMENT_ERROR);
  }
}

export const updateSubscriptionTierInStripe = async (
  stripeSubscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> => {
  try {
    const subscription =
      await stripe.subscriptions.retrieve(stripeSubscriptionId);

    return await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: "always_invoice",
    });
  } catch (error) {
    console.error("Error updating Stripe subscription:", error);
    throw new Error(ErrorMessages.STRIPE_UPDATE_SUBSCRIPTION_ERROR);
  }
};

async function getNextPaymentDate(stripeCustomerId: string) {
  try {
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: stripeCustomerId,
    });

    if (!upcomingInvoice.next_payment_attempt) {
      return null;
    }

    const nextPaymentDatePST = DateTime.fromSeconds(
      upcomingInvoice.next_payment_attempt
    )
      .setZone("America/Los_Angeles")
      .toFormat("yyyy-MM-dd hh:mm a z");

    return nextPaymentDatePST;
  } catch (error) {
    console.error("Error fetching next payment date:", error);
    return null;
  }
}
