"use client";

import { Button } from "@/components/ui/button";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState, FormEvent } from "react";

interface TicketPaymentFormProps {
  setPaymentSuccess: (arg0: boolean) => void;
}

const TicketPaymentForm: React.FC<TicketPaymentFormProps> = ({
  setPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handlePayment = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe is still loading. Please wait.");
      return;
    }

    setIsProcessing(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success",
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      console.log("Payment successful:", paymentIntent);
      setPaymentSuccess(true);
      setErrorMessage(null);
    }

    setIsProcessing(false);
  };

  if (!stripe || !elements) {
    return <div>Loading payment form...</div>;
  }
  return (
    <form onSubmit={handlePayment} className="mx-auto ">
      <PaymentElement />
      <Button
        type="submit"
        disabled={isProcessing || !stripe}
        className="mt-8 mb-4"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </form>
  );
};

export default TicketPaymentForm;
