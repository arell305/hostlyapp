"use client";

import EmailInput from "@/[slug]/events/[eventId]/components/EmailInput";
import PromoCodeInput from "@/[slug]/app/components/view/PromoCodeInput";
import CheckoutButton from "@/[slug]/app/components/view/CheckoutButton";
import TicketTermsAccepted from "./TicketTermsAccepted";

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
    <div className="py-3 px-7">
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
