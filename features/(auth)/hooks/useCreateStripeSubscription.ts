import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { SubscriptionTierType } from "@/shared/types/types";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

type CreateSubscriptionArgs = {
  email: string;
  paymentMethodId: string;
  subscriptionTier: SubscriptionTierType;
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
      return await createSubscriptionAction({
        email,
        paymentMethodId,
        subscriptionTier,
        idempotencyKey,
        promoCode,
      });
    } catch (err: any) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createStripeSubscription, isLoading, error, setIsLoading, setError };
};
