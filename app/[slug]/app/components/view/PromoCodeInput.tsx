"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import FieldErrorMessage from "@/components/shared/error/FieldErrorMessage";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { FrontendErrorMessages } from "@/types/enums";
import { api } from "convex/_generated/api";

const PromoCodeInput: React.FC<{ eventId: string }> = ({ eventId }) => {
  const {
    promoCode,
    setPromoCode,
    promoCodeError,
    setPromoCodeError,
    isPromoApplied,
    setIsPromoApplied,
    setValidationResult,
  } = useEventCheckout();

  const [shouldValidate, setShouldValidate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validatePromoQuery = useQuery(
    api.promoterPromoCode.validatePromoterPromoCode,
    shouldValidate ? { name: promoCode, eventId } : "skip"
  );

  useEffect(() => {
    if (!shouldValidate) {
      return;
    }

    setIsLoading(true);

    if (validatePromoQuery === undefined) {
      return;
    }

    setValidationResult(validatePromoQuery);
    setIsPromoApplied(true);

    setIsLoading(false);
    setShouldValidate(false);
  }, [
    shouldValidate,
    validatePromoQuery,
    setIsPromoApplied,
    setPromoCodeError,
    setValidationResult,
  ]);

  const handleApplyPromo = () => {
    if (!promoCode) {
      setPromoCodeError(FrontendErrorMessages.PROMO_CODE_REQUIRED);
      return;
    }
    setShouldValidate(true);
  };

  return (
    <div className="w-full">
      <Label htmlFor="promo-code" className="mb-1 block">
        Promo Code
      </Label>

      <div className="flex gap-4 w-full">
        <Input
          id="promo-code"
          type="text"
          placeholder="Promo code"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value);
            setPromoCodeError(null);
          }}
          readOnly={isPromoApplied}
          className="w-3/4"
          error={promoCodeError}
          disabled={isPromoApplied}
        />
        <Button
          variant="secondary"
          className="w-1/4 rounded-lg h-9 text-base "
          onClick={handleApplyPromo}
          isLoading={isLoading}
          disabled={isPromoApplied || promoCode.trim() === ""}
        >
          {isPromoApplied ? "Applied ✓" : "Apply"}
        </Button>
      </div>

      <FieldErrorMessage error={promoCodeError} />
    </div>
  );
};

export default PromoCodeInput;
