"use client";

import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

interface ConfirmGuestListPaymentOptions {
  clientSecret: string;
}

export function useConfirmGuestListPayment() {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPayment = async ({
    clientSecret,
  }: ConfirmGuestListPaymentOptions): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe is not initialized.");
      setLoading(false);
      return false;
    }

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // optional, safe fallback
        },
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message || "Payment confirmation failed.");
        return false;
      }

      const paymentIntent = result.paymentIntent;

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setError("Payment not successful.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Stripe confirmPayment error:", err);
      setError("An unexpected error occurred while processing payment.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    confirmPayment,
    loading,
    error,
    setError,
    setLoading,
  };
}
