"use client";

import { Input } from "@shared/ui/primitive/input";
import { Label } from "@shared/ui/primitive/label";
import { Button } from "@shared/ui/primitive/button";

interface PromoCodeInputProps {
  label?: string;
  promoCode: string;
  onChange: (value: string) => void;
  onApply: () => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  label = "Promo Code",
  promoCode,
  onChange,
  onApply,
  isLoading = false,
  error,
  success = false,
}) => {
  const isDisabled = promoCode.trim() === "";
  return (
    <div className="mb-6">
      <Label htmlFor="promoCode">{label}</Label>
      <div className="flex items-center justify-between ">
        <Input
          id="promoCode"
          value={promoCode}
          onChange={(e) => onChange(e.target.value)}
          className="w-[400px] "
          disabled={isLoading || success}
          placeholder="Enter promo code"
        />
        <Button
          onClick={onApply}
          type="button"
          className=" w-auto h-auto"
          disabled={isLoading || isDisabled || success}
          isLoading={isLoading}
          variant="secondary"
        >
          Apply
        </Button>
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      {success && !error && (
        <p className="text-green-600 text-sm mt-1">Promo code applied!</p>
      )}
    </div>
  );
};

export default PromoCodeInput;
