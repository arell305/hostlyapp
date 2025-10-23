import { FrontendErrorMessages } from "@/shared/types/enums";
import { Stripe, StripeElements } from "@stripe/stripe-js";
import { CardElement } from "@stripe/react-stripe-js";

export const createApplePaymentRequest = async (
  stripe: Stripe,
  amount: number,
  onPaymentMethod: (ev: any) => Promise<void>
): Promise<PaymentRequest | null> => {
  const pr = stripe.paymentRequest({
    country: "US",
    currency: "usd",
    total: {
      label: "Total",
      amount,
    },
    requestPayerName: true,
    requestPayerEmail: true,
  });

  const result = await pr.canMakePayment();
  if (!result) return null;

  pr.on("paymentmethod", onPaymentMethod);

  return pr as unknown as PaymentRequest;
};

// utils/stripeHelpers.ts
export const getCardPaymentMethod = async (
  stripe: Stripe | null,
  elements: StripeElements | null,
  email: string
) => {
  if (!stripe || !elements) {
    throw new Error(FrontendErrorMessages.GENERIC_ERROR);
  }

  const cardElement = elements.getElement(CardElement);
  if (!cardElement) {
    throw new Error(FrontendErrorMessages.ENTER_CARD);
  }

  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: "card",
    card: cardElement,
    billing_details: { email },
  });

  if (error || !paymentMethod) {
    throw new Error(FrontendErrorMessages.PAYMENT_PROCESSING);
  }

  return paymentMethod;
};
