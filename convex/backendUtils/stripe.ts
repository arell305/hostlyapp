import { STRIPE_API_VERSION, USD_CURRENCY } from "@/types/constants";
import { ErrorMessages, Gender } from "@/types/enums";
import Stripe from "stripe";
import { Id } from "../_generated/dataModel";
import { pricingOptions } from "../../constants/pricingOptions";
import { calculateDiscount } from "./helper";
import { ProratedPrice } from "@/types/types";

if (!process.env.STRIPE_KEY) {
  throw new Error(ErrorMessages.ENV_NOT_SET_STRIPE_KEY);
}
export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: STRIPE_API_VERSION,
});

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
        metadata: { resumedAt: new Date().toISOString() },
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

    const promoCodeId = subscription.discount?.coupon?.id || null;

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: "always_invoice",
        ...(promoCodeId && { promotion_code: promoCodeId }),
      }
    );
    console.log("update", updatedSubscription);
    return updatedSubscription;
  } catch (error) {
    console.error("Error updating Stripe subscription:", error);
    throw new Error(ErrorMessages.STRIPE_UPDATE_SUBSCRIPTION_ERROR);
  }
};

export async function createStripeCustomer(
  email: string
): Promise<Stripe.Response<Stripe.Customer>> {
  try {
    return await stripe.customers.create({ email });
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new Error(ErrorMessages.STRIPE_CUSTOMER_CREATE);
  }
}

export async function attachPaymentMethod(
  paymentMethodId: string,
  stripeCustomerId: string
): Promise<Stripe.Response<Stripe.PaymentMethod>> {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });
    return paymentMethod;
  } catch (error) {
    console.error("Error attaching payment method:", error);
    throw new Error(ErrorMessages.STRIPE_ATTACH_PAYMENT);
  }
}

export async function setDefaultPaymentMethod(
  stripeCustomerId: string,
  paymentMethodId: string
): Promise<Stripe.Response<Stripe.Customer>> {
  try {
    const customer = await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return customer;
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw new Error(ErrorMessages.STRIPE_DEFAULT_PAYMENT);
  }
}

export async function createSubscription(
  stripeCustomerId: string,
  priceId: string,
  trialPeriodDays?: number,
  promoCodeId?: string | null
): Promise<Stripe.Subscription> {
  try {
    const subscriptionOptions: Stripe.SubscriptionCreateParams = {
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
      ...(trialPeriodDays && { trial_period_days: trialPeriodDays }),
    };

    if (promoCodeId) {
      subscriptionOptions.promotion_code = promoCodeId;
    }

    return await stripe.subscriptions.create(subscriptionOptions);
  } catch (error) {
    console.error("Error setting default payment method:", error);
    throw new Error(ErrorMessages.STRIPE_CREATE_SUBSCRIPTION);
  }
}

export async function verifyStripeWebhook(
  payload: string,
  sig: string
): Promise<Stripe.Event> {
  const secret = process.env.STRIPE_WEBHOOKS_SECRET;
  if (!secret) {
    console.error("Stripe webhook secret is not configured!");
    throw new Error(ErrorMessages.ENV_NOT_SET_STRIPE_WEBHOOKS_SECRET);
  }

  try {
    return await stripe.webhooks.constructEventAsync(payload, sig, secret);
  } catch (error) {
    console.error(" Webhook verification failed:", error);
    throw new Error(ErrorMessages.STRIPE_WEBHOOK_VERIFICATION);
  }
}

export const getLatestUnpaidInvoice = async (
  stripeCustomerId: string
): Promise<Stripe.Invoice | null> => {
  try {
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 1,
      status: "open",
    });

    return invoices.data.length > 0 ? invoices.data[0] : null;
  } catch (error) {
    console.error("Error fetching latest unpaid invoice:", error);
    throw new Error(ErrorMessages.STRIPE_LATEST_UNPAID_INVOICE);
  }
};

export const payUnpaidInvoice = async (
  invoiceId: string
): Promise<Stripe.Invoice | null> => {
  try {
    return await stripe.invoices.pay(invoiceId);
  } catch (error) {
    console.error("Error paying invoice:", error);
    throw new Error(ErrorMessages.STRIPE_RETRY_INVOICE_PAYMENT);
  }
};

export const getPaymentIntentWithMetadata = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      throw new Error(ErrorMessages.STRIPE_PAYMENT_INTENT_NOT_FOUND);
    }

    return paymentIntent;
  } catch (error) {
    console.error("Error retrieving Payment Intent:", error);
    throw new Error(ErrorMessages.STRIPE_GET_PAYMENT_INTENT);
  }
};

export interface PaymentMethodDetails {
  last4?: string;
  cardBrand?: string;
}

export async function getPaymentMethodDetails(
  paymentMethodId: string
): Promise<PaymentMethodDetails> {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return {
      last4: paymentMethod.card?.last4,
      cardBrand: paymentMethod.card?.brand,
    };
  } catch (error) {
    console.error("Error fetching payment method details:", error);
    throw new Error(ErrorMessages.STRIPE_FETCHING_PAYMENT);
  }
}

export const getProratedPricesForAllTiers = async (
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  promoCodeId?: string
): Promise<ProratedPrice[]> => {
  const subscription = await retrieveSubscription(stripeSubscriptionId);
  const currentPriceId = subscription.items.data[0].price.id;

  let discountPercentage = 0;
  if (promoCodeId) {
    const promo = await retrievePromotionCode(promoCodeId);
    if (promo?.coupon?.percent_off) {
      discountPercentage = promo.coupon.percent_off;
    }
  }

  const proratedPrices: ProratedPrice[] = [];

  for (const { priceId, tier } of pricingOptions) {
    const price = await retrievePrice(priceId);
    const fullMonthlyPrice = (price.unit_amount ?? 0) / 100;
    const monthlyPrice = calculateDiscount(
      fullMonthlyPrice,
      discountPercentage
    );

    if (priceId === currentPriceId) {
      proratedPrices.push({
        tier,
        proratedAmount: "0",
        discountApplied: !!promoCodeId,
        monthlyAmount: monthlyPrice.toFixed(2),
      });
      continue;
    }

    const upcomingInvoice = await retrieveUpcomingInvoice({
      stripeCustomerId,
      stripeSubscriptionId,
      subscription,
      priceId,
    });

    const proratedAmount = upcomingInvoice.total / 100;

    const discountedAmount = calculateDiscount(
      proratedAmount,
      discountPercentage
    );

    proratedPrices.push({
      tier,
      proratedAmount: discountedAmount.toFixed(2),
      discountApplied: discountPercentage > 0,
      monthlyAmount: monthlyPrice.toFixed(2),
    });
  }

  return proratedPrices;
};

export const deleteStripeProduct = async (
  stripeProductId: string
): Promise<void> => {
  try {
    await stripe.products.del(stripeProductId);
  } catch (error) {
    console.error(
      ` Failed to delete Stripe product ${stripeProductId}:`,
      error
    );
    throw new Error(ErrorMessages.STRIPE_PRODUCT_DELETE);
  }
};

export async function createStripePrices(
  productId: string,
  maleTicketPrice: number,
  femaleTicketPrice: number,
  maleTicketCapacity: number,
  femaleTicketCapacity: number,
  stripeAccountId: string
): Promise<{ malePrice: Stripe.Price; femalePrice: Stripe.Price }> {
  try {
    const [malePrice, femalePrice] = await Promise.all([
      stripe.prices.create(
        {
          unit_amount: maleTicketPrice * 100,
          currency: USD_CURRENCY,
          product: productId,
          metadata: {
            ticketType: Gender.Male,
            capacity: maleTicketCapacity,
          },
        },
        { stripeAccount: stripeAccountId }
      ),
      stripe.prices.create(
        {
          unit_amount: femaleTicketPrice * 100,
          currency: USD_CURRENCY,
          product: productId,
          metadata: {
            ticketType: Gender.Female,
            capacity: femaleTicketCapacity,
          },
        },
        { stripeAccount: stripeAccountId }
      ),
    ]);
    return { malePrice, femalePrice };
  } catch (error) {
    console.error("Error creating Stripe prices:", error);
    throw new Error(ErrorMessages.STRIPE_CREATE_PRICES);
  }
}

export async function createStripeProduct(
  eventId: Id<"events">,
  ticketSalesEndTime: number,
  stripeAccountId: string
): Promise<Stripe.Product> {
  try {
    const product = await stripe.products.create(
      {
        name: `Event Ticket - ${eventId}`,
        description: `Tickets for event ${eventId}`,
        metadata: { eventId, ticketSalesEndTime },
      },
      { stripeAccount: stripeAccountId }
    );
    return product;
  } catch (error) {
    console.error("Error creating Stripe product:", error);
    throw new Error(ErrorMessages.STRIPE_CREATE_PRODUCT);
  }
}

async function retrieveSubscription(
  stripeSubscriptionId: string
): Promise<Stripe.Response<Stripe.Subscription>> {
  try {
    const subscription =
      await stripe.subscriptions.retrieve(stripeSubscriptionId);

    if (!subscription || !subscription.items.data.length) {
      throw new Error(ErrorMessages.STRIPE_SUBSCRIPTION_NOT_FOUND);
    }

    return subscription;
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    throw new Error(ErrorMessages.STRIPE_RETRIEVE);
  }
}

interface RetrieveUpcomingInvoiceParams {
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  subscription: Stripe.Response<Stripe.Subscription>;
  priceId?: string;
}

async function retrieveUpcomingInvoice({
  stripeCustomerId,
  stripeSubscriptionId,
  subscription,
  priceId,
}: RetrieveUpcomingInvoiceParams): Promise<
  Stripe.Response<Stripe.UpcomingInvoice>
> {
  try {
    return await stripe.invoices.retrieveUpcoming({
      customer: stripeCustomerId,
      subscription: stripeSubscriptionId,
      subscription_items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
    });
  } catch (error) {
    console.error("Error retrieving upcoming invoice:", error);
    throw new Error(ErrorMessages.STRIPE_RETRIEVE_INVOICE);
  }
}

export async function retrievePromotionCode(
  promoCodeId: string
): Promise<Stripe.PromotionCode | null> {
  try {
    const promotionCode = await stripe.promotionCodes.retrieve(promoCodeId);
    return promotionCode;
  } catch (error) {
    console.error(`Failed to retrieve promotion code ${promoCodeId}:`, error);
    return null;
  }
}

async function retrievePrice(priceId: string): Promise<Stripe.Price> {
  try {
    const price = await stripe.prices.retrieve(priceId);
    return price;
  } catch (error) {
    console.error(`Failed to retrieve price with ID ${priceId}:`, error);
    throw new Error(ErrorMessages.STRIPE_RETRIEVE_PRICE);
  }
}

type CreatePaymentIntentResult =
  | { success: true; paymentIntent: Stripe.PaymentIntent }
  | { success: false; error: string };

export async function createPaymentIntent({
  amount,
  metadata,
}: {
  amount: number;
  metadata: Record<string, string | number>;
}): Promise<CreatePaymentIntentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata,
    });

    return { success: true, paymentIntent };
  } catch (error) {
    console.error("Error creating PaymentIntent:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
