"use client";

import { useEventCheckout } from "@/shared/hooks/contexts";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState, FormEvent } from "react";
import { Button } from "../primitive/button";

const TicketPaymentForm: React.FC = () => {
  const { setPaymentSuccess } = useEventCheckout();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState<boolean>(false);

  const handlePayment = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe is still loading. Please wait.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || "Form validation failed.");
      setIsProcessing(false);
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
    <form onSubmit={handlePayment} className="mx-auto">
      <PaymentElement
        onChange={(event) => {
          setIsPaymentComplete(event.complete);
        }}
      />
      <Button
        type="submit"
        disabled={isProcessing || !stripe || !isPaymentComplete}
        className="mt-8 mb-4"
        isLoading={isProcessing}
      >
        Pay Now
      </Button>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </form>
  );
};

export default TicketPaymentForm;
