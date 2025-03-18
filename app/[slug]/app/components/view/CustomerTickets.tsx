import React from "react";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { formatCurrency } from "../../../../../utils/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PromoterPromoCodeWithDiscount } from "@/types/schemas-types";

interface CustomerTicketViewProps {
  maleCount: number;
  femaleCount: number;
  promoCode: string;
  setPromoCode: (arg0: string) => void;
  setPromoCodeError: (arg0: string) => void;
  promoCodeError: string;
  onApplyPromo: () => void;
  isApplyPromoCodeLoading: boolean;
  isPromoApplied: boolean;
  validationResult: PromoterPromoCodeWithDiscount | null;
  onCheckout: () => void;
  checkoutError: string | null;
  isCheckoutLoading: boolean;
  totalMalePrice: number;
  totalFemalePrice: number;
  totalDiscount: number;
  discountAmount: number;
  totalPrice: number;
  email: string;
  setEmail: (arg0: string) => void;
  emailError: string | null;
  setEmailError: (arg0: string | null) => void;
}

// To be Deleted

const CustomerTicketView: React.FC<CustomerTicketViewProps> = ({
  maleCount,
  femaleCount,
  promoCode,
  setPromoCode,
  setPromoCodeError,
  promoCodeError,
  onApplyPromo,
  isApplyPromoCodeLoading,
  isPromoApplied,
  validationResult,
  onCheckout,
  checkoutError,
  isCheckoutLoading,
  totalMalePrice,
  totalFemalePrice,
  totalDiscount,
  discountAmount,
  totalPrice,
  email,
  setEmail,
  emailError,
  setEmailError,
}) => {
  return (
    <div>
      <div className="mt-4 space-y-2">
        <h3 className="font-semibold">Order Summary</h3>
        {maleCount > 0 && (
          <p>
            Male Tickets: {maleCount} x {formatCurrency(totalMalePrice)}
          </p>
        )}
        {femaleCount > 0 && (
          <p>
            Female Tickets: {femaleCount} x {formatCurrency(totalFemalePrice)}
          </p>
        )}
        {validationResult && (
          <p className="text-green-600">
            Discount Applied: -{formatCurrency(totalDiscount)} ($
            {discountAmount} per ticket)
          </p>
        )}
        <p className="font-semibold">Total: {formatCurrency(totalPrice)}</p>
      </div>
      <div className="mt-4">
        <Label>Email Address</Label>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          required
        />
        <p
          className={`text-sm mt-1 ${emailError ? "text-red-500" : "text-transparent"}`}
        >
          {emailError || "Placeholder to maintain height"}
        </p>
      </div>
      <div className="mt-4">
        <Label>Promo Code</Label>
        <div className="flex">
          <Input
            type="promo code"
            placeholder="Enter any promo code"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setPromoCodeError("");
            }}
            error={promoCodeError}
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
      <div className="mt-4">
        <Button
          className="w-full"
          onClick={onCheckout}
          disabled={isCheckoutLoading}
        >
          {isCheckoutLoading ? "Checking Out..." : "Checkout"}
        </Button>
        <p
          className={`pl-4 text-sm mt-1 ${checkoutError ? "text-red-500" : "text-transparent"}`}
        >
          {checkoutError || "Placeholder to maintain height"}
        </p>
      </div>
    </div>
  );
};

export default CustomerTicketView;
