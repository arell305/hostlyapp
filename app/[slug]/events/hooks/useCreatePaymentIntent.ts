import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { setErrorFromConvexError } from "@/lib/errorHelper";

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
    description: string,
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
        description,
      });

      setClientSecret(response);
      return response;
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPaymentIntent, clientSecret, isLoading, error, setError };
};
