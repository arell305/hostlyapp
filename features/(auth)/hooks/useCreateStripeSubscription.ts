import { useAction } from "convex/react";
import { useState } from "react";
import { ResponseStatus, SubscriptionTier } from "@shared/types/enums";
import { api } from "@/convex/_generated/api";

type CreateSubscriptionArgs = {
  email: string;
  paymentMethodId: string;
  subscriptionTier: SubscriptionTier;
  idempotencyKey: string;
  promoCode?: string | null;
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
    subscriptionTier,
    idempotencyKey,
    promoCode,
  }: CreateSubscriptionArgs): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createSubscriptionAction({
        email,
        paymentMethodId,
        subscriptionTier,
        idempotencyKey,
        promoCode,
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
