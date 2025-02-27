"use client";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState, FormEvent } from "react";
import { PaymentIntent } from "@stripe/stripe-js";

const TicketPaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const handlePayment = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe is not initialized.");
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success", // Redirect to success page if necessary
      },
      redirect: "if_required", // Prevents automatic redirection
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      console.log("Payment successful:", paymentIntent);
      setPaymentSuccess(true);
      setErrorMessage(null); // Clear any previous errors
    }

    setIsProcessing(false);
  };

  return (
    <div>
      {paymentSuccess ? (
        <div className="text-green-500">✅ Payment successful!</div>
      ) : (
        <form onSubmit={handlePayment}>
          <PaymentElement />
          <button type="submit" disabled={isProcessing || !stripe}>
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>
          {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        </form>
      )}
    </div>
  );
};

export default TicketPaymentForm;
