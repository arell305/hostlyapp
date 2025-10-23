import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

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
      return await addOrUpdate({ name });
    } catch (error) {
      setErrorFromConvexError(error, setError);
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
