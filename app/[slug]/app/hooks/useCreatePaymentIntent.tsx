"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ResponseStatus } from "@/types/enums";

interface UseCreateGuestListPaymentIntent {
  createPaymentIntent: (args: { quantity: number }) => Promise<string | null>;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export function useCreateGuestListPaymentIntent(): UseCreateGuestListPaymentIntent {
  const createPaymentIntentAction = useAction(
    api.guestListCreditTransactions.createGuestListCreditPaymentIntent
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async ({
    quantity,
  }: {
    quantity: number;
  }): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await createPaymentIntentAction({ quantity });
      console.log("result payment intent", result);
      if (result.status === ResponseStatus.ERROR) {
        setError(result.error || "Failed to create payment intent.");
        return null;
      }

      const clientSecret = result.data.clientSecret;

      if (!clientSecret) {
        setError("Missing client secret from server.");
        return null;
      }

      return clientSecret;
    } catch (err) {
      console.error("Error creating PaymentIntent:", err);
      setError("An unexpected error occurred.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPaymentIntent,
    loading,
    error,
    setError,
  };
}
