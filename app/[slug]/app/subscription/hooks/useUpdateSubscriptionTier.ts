import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { SubscriptionTier } from "@/types/enums";
import { setErrorFromConvexError } from "@/lib/errorHelper";

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
      return await updateTierAction({ newTier });
    } catch (err) {
      setErrorFromConvexError(err, setError);
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
