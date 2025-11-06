"use client";

import TermsCheckbox from "@shared/ui/fields/TermsCheckbox";
import { useEventCheckout } from "@/shared/hooks/contexts";

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
