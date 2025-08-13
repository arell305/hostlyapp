"use client";
import PaymentForm from "./PaymentForm";
import React from "react";
import { stripePromise } from "../../utils/stripe";
import { Elements } from "@stripe/react-stripe-js";
import { stripeAppearance } from "@/utils/frontend-stripe/stripeAppearance";

export default function CheckoutPage() {
  // If your currency varies, compute it here and (optionally) give <Elements> a key to remount
  const elementsOptions = {
    mode: "setup",
    currency: "usd", // use your plan currency
    paymentMethodCreation: "manual",
    appearance: stripeAppearance,
  } as const;

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <PaymentForm />
    </Elements>
  );
}
