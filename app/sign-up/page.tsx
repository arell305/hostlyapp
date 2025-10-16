"use client";
import PaymentForm from "./PaymentForm";
import React from "react";
import { stripePromise } from "../../utils/stripe";
import { Elements } from "@stripe/react-stripe-js";
import { stripeAppearance } from "@/utils/frontend-stripe/stripeAppearance";

export default function CheckoutPage() {
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
