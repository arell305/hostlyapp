import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PromoCodeInputProps {
  label?: string;
  promoCode: string;
  onChange: (value: string) => void;
  onApply: () => void;
  isLoading?: boolean;
  error?: string | null;
  success?: boolean;
  disabled?: boolean;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  label = "Promo Code",
  promoCode,
  onChange,
  onApply,
  isLoading = false,
  error,
  success = false,
  disabled = false,
}) => {
  return (
    <div className="mb-6">
      <Label htmlFor="promoCode">{label}</Label>
      <div className="flex items-center mt-1">
        <Input
          id="promoCode"
          value={promoCode}
          onChange={(e) => onChange(e.target.value)}
          className="md:w-[300px]"
          disabled={isLoading || disabled}
          placeholder="Enter promo code"
        />
        <Button
          onClick={onApply}
          type="button"
          className="ml-4 bg-cardBackgroundHover"
          disabled={isLoading || disabled}
          isLoading={isLoading}
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
