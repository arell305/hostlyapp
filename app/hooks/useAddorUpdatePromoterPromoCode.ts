import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { FrontendErrorMessages, ResponseStatus } from "@/types/enums";

export const useAddOrUpdatePromoterPromoCode = () => {
  const addOrUpdate = useMutation(
    api.promoterPromoCode.addOrUpdatePromoterPromoCode
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addPromoCode = async (name: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await addOrUpdate({ name });
      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (error) {
      setError(FrontendErrorMessages.GENERIC_ERROR);
      console.error("Error adding/updating promoter promo code:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addPromoCode,
    isLoading,
    error,
    setError,
  };
};
