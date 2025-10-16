"use client";
import { PaymentElement } from "@stripe/react-stripe-js";
import SingleSubmitButton from "@/components/shared/buttonContainers/SingleSubmitButton";
import { Label } from "@/components/ui/label";
import TermsCheckbox from "@/components/shared/fields/TermsCheckbox";
import { isValidEmail } from "@/utils/helpers";

interface PaymentDetailsSectionProps {
  stripeReady: boolean;
  isLoading: boolean;
  error: string | null;
  onCardChange: (e: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isCardComplete: boolean;
  email: string;
  termsAccepted: boolean;
  onTermsAccepted: (accepted: boolean) => void;
}

const PaymentDetailsSection: React.FC<PaymentDetailsSectionProps> = ({
  stripeReady,
  isLoading,
  error,
  onCardChange,
  handleSubmit,
  isCardComplete,
  email,
  termsAccepted,
  onTermsAccepted,
}) => {
  const isDisabled =
    !stripeReady ||
    isLoading ||
    !isCardComplete ||
    !isValidEmail(email) ||
    !termsAccepted;

  return (
    <>
      <Label>Payment Details</Label>
      <div className="p-2 border mb-6 text-white rounded-md focus-within:border-primaryBlue">
        <PaymentElement
          onChange={onCardChange as any}
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <TermsCheckbox
        termsAccepted={termsAccepted}
        onTermsAccepted={onTermsAccepted}
      />

      <SingleSubmitButton
        isLoading={isLoading}
        error={error}
        onClick={handleSubmit}
        disabled={isDisabled}
        label="Subscribe"
      />
    </>
  );
};

export default PaymentDetailsSection;
