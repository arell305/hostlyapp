import React from "react";
import { Button } from "@/components/ui/button";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import FieldErrorMessage from "@/components/shared/error/FieldErrorMessage";
import { isValidEmail } from "@/utils/helpers";

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
  const { email, emailError, termsAccepted } = useEventCheckout();

  const isDisabled =
    !isValidEmail(email) || emailError !== null || !termsAccepted;

  return (
    <div className="mt-4">
      <Button
        className="w-full"
        onClick={onCheckout}
        isLoading={isCheckoutLoading}
        disabled={isDisabled}
      >
        Checkout
      </Button>
      <FieldErrorMessage error={checkoutError} />
    </div>
  );
};

export default CheckoutButton;
