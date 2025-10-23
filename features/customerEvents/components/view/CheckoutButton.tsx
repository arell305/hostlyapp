"use client";

import { Button } from "@shared/ui/primitive/button";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import FieldErrorMessage from "@shared/ui/error/FieldErrorMessage";
import { isValidEmail } from "@/shared/utils/helpers";

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
