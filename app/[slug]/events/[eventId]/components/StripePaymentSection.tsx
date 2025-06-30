"use client";

import { Elements } from "@stripe/react-stripe-js";
import { Stripe } from "@stripe/stripe-js";
import TicketPaymentForm from "@/[slug]/app/components/TicketPaymentForm";
import { Button } from "@/components/ui/button";
import { stripeAppearance } from "@/utils/frontend-stripe/stripeAppearance";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";

interface StripePaymentSectionProps {
  stripePromise: Promise<Stripe | null>;
}

const StripePaymentSection: React.FC<StripePaymentSectionProps> = ({
  stripePromise,
}) => {
  const { clientSecret, setClientSecret } = useEventCheckout();
  const handleOnBack = () => {
    setClientSecret(null);
  };
  return (
    <div className="py-5 px-7 space-y-4">
      <Button onClick={handleOnBack} variant="navGhost" size="nav">
        ← Back to ticket selection
      </Button>

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance: stripeAppearance }}
        >
          <TicketPaymentForm />
        </Elements>
      )}
    </div>
  );
};

export default StripePaymentSection;
