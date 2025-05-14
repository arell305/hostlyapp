import React from "react";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  onCheckout: () => void;
  isCheckoutLoading: boolean;
  checkoutError: string | null;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  onCheckout,
  isCheckoutLoading,
  checkoutError,
}) => {
  return (
    <div className="mt-4">
      <Button
        className="w-full"
        onClick={onCheckout}
        disabled={isCheckoutLoading}
        isLoading={isCheckoutLoading}
      >
        Checkout
      </Button>
      <p
        className={`pl-4 text-sm mt-1 ${checkoutError ? "text-red-500" : "text-transparent"}`}
      >
        {checkoutError || "Placeholder to maintain height"}
      </p>
    </div>
  );
};

export default CheckoutButton;
