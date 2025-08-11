import { FrontendErrorMessages } from "@/types/enums";
import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ValidatePromoCodeResponse } from "@/types/convex-types";

export const useValidatePromoCode = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const validatePromoCode = useAction(api.stripe.validatePromoCode);

  const handleValidatePromoCode = async (
    promoCode: string
  ): Promise<ValidatePromoCodeResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await validatePromoCode({ promoCode });
      return response;
    } catch (error) {
      console.error("Error validating promo code", error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { isValid: false, approvedPromoCode: null, discount: null };
    } finally {
      setLoading(false);
    }
  };

  return { handleValidatePromoCode, loading, error };
};
