"use client";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import { useConfirmGuestListPayment } from "../../hooks/useConfirmGuestListPayment";

interface PaymentFormProps {
  clientSecret: string;
  totalAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  totalAmount,
  onSuccess,
  onCancel,
}) => {
  const { confirmPayment, loading, error, setError, setLoading } =
    useConfirmGuestListPayment();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      setError("Stripe is not initialized.");
      setLoading(false);
      return;
    }

    try {
      const confirmResult = await confirmPayment({
        clientSecret,
      });
      if (confirmResult) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-2">
      <PaymentElement />

      <FormActions
        onCancel={onCancel}
        onSubmit={handleSubmit}
        cancelText="Cancel"
        submitText={`Pay $${totalAmount.toFixed(2)}`}
        loadingText="Processing"
        isSubmitDisabled={loading}
        isLoading={loading}
        error={error}
        submitVariant="default"
      />
    </div>
  );
};
