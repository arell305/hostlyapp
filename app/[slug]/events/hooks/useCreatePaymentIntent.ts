import { useAction } from "convex/react";
import { useState } from "react";
import { ResponseStatus } from "@/types/enums"; // Adjust path if needed
import { api } from "../../../../convex/_generated/api";

type PaymentMetadata = {
  eventId: string;
  promoCode?: string;
  email: string;
  organizationId: string;
  ticketTypes: {
    eventTicketTypeId: string;
    quantity: number;
  }[];
};

export const useCreatePaymentIntent = () => {
  const createPaymentIntentAction = useAction(api.stripe.createPaymentIntent);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createPaymentIntent = async (
    totalAmount: number,
    stripeAccountId: string,
    metadata?: PaymentMetadata
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setClientSecret(null);

    try {
      const response = await createPaymentIntentAction({
        totalAmount,
        stripeAccountId,
        metadata,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        setClientSecret(response.data.clientSecret);
        return response.data.clientSecret;
      }

      setError("Failed to create payment intent.");
      return null;
    } catch (err: any) {
      console.error("Create payment intent error:", err);
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPaymentIntent, clientSecret, isLoading, error, setError };
};
