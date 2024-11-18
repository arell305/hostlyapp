import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface UpdatePaymentFormProps {
  setIsEditingPayment: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
}

const UpdatePaymentForm: React.FC<UpdatePaymentFormProps> = ({
  setIsEditingPayment,
  email,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateSubscriptionPaymentMethod = useAction(
    api.stripe.updateSubscriptionPaymentMethod
  );
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setLoading(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      await updateSubscriptionPaymentMethod({
        email,
        newPaymentMethodId: paymentMethod.id,
      });

      setIsEditingPayment(false); // Close the form on success
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditingPayment(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <Label>Card Details</Label>
        <div className="p-2 border rounded w-full md:w-[400px]">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                },
              },
            }}
          />
        </div>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <Button
          type="submit"
          disabled={loading}
          className="shadow-md w-full bg-customLightBlue font-semibold hover:bg-customDarkerBlue h-[45px] md:w-[200px] text-black"
        >
          {loading ? "Processing..." : "Update"}
        </Button>
        <Button type="button" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default UpdatePaymentForm;

// pm_1QM59jRv8MX5Pza1cvdl8q0L
