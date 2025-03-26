import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PromoCodeInputProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoCodeError: string | null;
  setPromoCodeError: (error: string | null) => void;
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
    <div className="w-full">
      <Label htmlFor="promo-code" className="mb-1 block">
        Promo Code
      </Label>

      <div className="flex gap-4 w-full">
        <Input
          id="promo-code"
          type="text"
          placeholder="Enter any promo code"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value);
            setPromoCodeError(null);
          }}
          readOnly={isPromoApplied}
          className="w-3/4"
          error={promoCodeError}
        />
        <Button
          disabled={isApplyPromoCodeLoading || isPromoApplied}
          variant="secondary"
          className={`w-1/4 rounded-lg h-9 text-base ${
            isPromoApplied ? "border-b border-customDarkBlue" : ""
          }`}
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
        className={`text-xs mt-1 ${
          promoCodeError ? "text-red-500" : "text-transparent"
        }`}
      >
        {promoCodeError || "Placeholder to maintain height"}
      </p>
    </div>
  );
};

export default PromoCodeInput;
