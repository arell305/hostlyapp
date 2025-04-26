import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  ResponseStatus,
  FrontendErrorMessages,
  SubscriptionTier,
} from "@/types/enums";

export const useUpdateSubscriptionTier = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateTierAction = useAction(api.stripe.updateSubscriptionTier);

  const updateSubscriptionTier = async (
    newTier: SubscriptionTier
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateTierAction({ newTier });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(response.error);
      return false;
    } catch (err) {
      console.error(err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateSubscriptionTier,
    isLoading,
    error,
  };
};
