import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { FrontendErrorMessages } from "@/types/enums";
import { ResponseStatus, SubscriptionTier } from "../../../../utils/enum";

export const useReactivateSubscription = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const reactivateSubscription = useAction(
    api.stripe.reactivateStripeSubscription
  );
  const [slug, setSlug] = useState<null | string>(null);

  const handleReactivate = async ({
    paymentMethodId,
    priceId,
    promoCodeId = null,
    subscriptionTier,
  }: {
    paymentMethodId: string;
    priceId: string;
    promoCodeId?: string | null;
    subscriptionTier: SubscriptionTier;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSlug(null);
    try {
      const response = await reactivateSubscription({
        paymentMethodId,
        priceId,
        promoCodeId,
        subscriptionTier,
      });
      if (response.status === ResponseStatus.SUCCESS) {
        setSlug(response.data.organization.slug);
        return true;
      } else {
        console.error("Error reactivating subscription", response.error);
        setError(response.error);
        return false;
      }
    } catch (error) {
      console.error("Error reactivating subscription", error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleReactivate, loading, error, setError, slug };
};
