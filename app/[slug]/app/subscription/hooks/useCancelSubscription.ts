import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, FrontendErrorMessages } from "@/types/enums";

export const useCancelSubscription = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cancelSubscriptionAction = useAction(api.customers.cancelSubscription);

  const cancelSubscription = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cancelSubscriptionAction({});

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

  return { cancelSubscription, isLoading, error, setError };
};
