"use client";

import EmailInput from "@/shared/ui/form/EmailInput";
import TicketTermsAccepted from "./TicketTermsAccepted";
import CheckoutButton from "./view/CheckoutButton";
import PromoCodeInput from "./view/PromoCodeInput";

interface TicketCheckoutFormProps {
  eventId: string;
  isCheckoutLoading: boolean;
  checkoutError: string | null;
  onCheckout: () => void;
}

const TicketCheckoutForm: React.FC<TicketCheckoutFormProps> = ({
  eventId,
  isCheckoutLoading,
  checkoutError,
  onCheckout,
}) => {
  return (
    <div className="py-3 px-4">
      <EmailInput />
      <PromoCodeInput eventId={eventId} />
      <TicketTermsAccepted />
      <CheckoutButton
        onCheckout={onCheckout}
        checkoutError={checkoutError}
        isCheckoutLoading={isCheckoutLoading}
      />
    </div>
  );
};

export default TicketCheckoutForm;
