import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";

export type ValidatePromoCodeResult = {
  isValid: boolean;
  approvedPromoCode: string | null;
  discount: number | null;
};

export const useValidatePromoCode = () => {
  const validatePromoCodeAction = useAction(api.stripe.validatePromoCode);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validatePromoCode = async (
    promoCode: string
  ): Promise<ValidatePromoCodeResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result: ValidatePromoCodeResult = await validatePromoCodeAction({
        promoCode,
      });
      return result;
    } catch (err: any) {
      console.error("Promo code validation error:", err);
      setError(err.message || "Failed to validate promo code.");
      return { isValid: false, approvedPromoCode: null, discount: null };
    } finally {
      setIsLoading(false);
    }
  };

  return { validatePromoCode, isLoading, error, setError };
};
