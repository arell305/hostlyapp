import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PromoCodeInputProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoCodeError: string;
  setPromoCodeError: (error: string) => void;
  isApplyPromoCodeLoading: boolean;
  isPromoApplied: boolean;
  onApplyPromo: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  promoCode,
  setPromoCode,
  promoCodeError,
  setPromoCodeError,
  isApplyPromoCodeLoading,
  isPromoApplied,
  onApplyPromo,
}) => {
  return (
    <div className="mt-4">
      <Label>Promo Code</Label>
      <div className="flex">
        <Input
          type="text"
          placeholder="Enter any promo code"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value);
            setPromoCodeError("");
          }}
          readOnly={isPromoApplied}
        />
        <Button
          disabled={isApplyPromoCodeLoading || isPromoApplied}
          variant="secondary"
          className={`rounded-lg ml-6 ${isPromoApplied ? "border-b border-customDarkBlue" : ""}`}
          onClick={onApplyPromo}
        >
          {isPromoApplied
            ? "Applied ✓"
            : isApplyPromoCodeLoading
              ? "Applying..."
              : "Apply"}
        </Button>
      </div>
      <p
        className={`text-sm mt-1 ${promoCodeError ? "text-red-500" : "text-transparent"}`}
      >
        {promoCodeError || "Placeholder to maintain height"}
      </p>
    </div>
  );
};

export default PromoCodeInput;
