"use client";

import PaymentForm from "./components/PaymentForm";
import { stripePromise } from "@shared/utils/stripe";
import { Elements } from "@stripe/react-stripe-js";
import { stripeAppearance } from "@/shared/utils/frontend-stripe/stripeAppearance";

export default function SignUpPage() {
  const elementsOptions = {
    mode: "setup",
    currency: "usd",
    paymentMethodCreation: "manual",
    appearance: stripeAppearance,
  } as const;

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm />
    </Elements>
  );
}
