import TermsCheckbox from "@/components/shared/fields/TermsCheckbox";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import React from "react";

const TicketTermsAccepted = () => {
  const { termsAccepted, setTermsAccepted } = useEventCheckout();
  return (
    <TermsCheckbox
      termsAccepted={termsAccepted}
      onTermsAccepted={setTermsAccepted}
    />
  );
};

export default TicketTermsAccepted;
