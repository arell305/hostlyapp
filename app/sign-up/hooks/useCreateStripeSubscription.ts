import { useAction } from "convex/react";
import { useState } from "react";
import { ResponseStatus, SubscriptionTier } from "@/types/enums"; // Update path if needed
import { api } from "../../../convex/_generated/api";

type CreateSubscriptionArgs = {
  email: string;
  paymentMethodId: string;
  priceId: string;
  promoCodeId?: string | null;
  subscriptionTier: SubscriptionTier;
};

export const useCreateStripeSubscription = () => {
  const createSubscriptionAction = useAction(
    api.stripe.createStripeSubscription
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createStripeSubscription = async ({
    email,
    paymentMethodId,
    priceId,
    promoCodeId,
    subscriptionTier,
  }: CreateSubscriptionArgs): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createSubscriptionAction({
        email,
        paymentMethodId,
        priceId,
        promoCodeId,
        subscriptionTier,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(response.error);
      return false;
    } catch (err: any) {
      console.error("Stripe subscription error:", err);
      setError(err.message || "Unexpected subscription error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createStripeSubscription, isLoading, error, setIsLoading, setError };
};
