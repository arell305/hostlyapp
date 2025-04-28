import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Stripe from "stripe";

export function useConfirmGuestListPayment() {
  const stripe = useStripe();
  const elements = useElements();

  const createGuestListCredit = useMutation(
    api.guestListCredits.createGuestListCredit
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPayment = async ({
    clientSecret,
  }: {
    clientSecret: string;
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe is not initialized.");
      setLoading(false);
      return false;
    }

    try {
      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement("card")!,
        },
      });

      if (confirmResult.error) {
        setError(confirmResult.error.message || "Payment confirmation failed.");
        setLoading(false);
        return false;
      }

      if (confirmResult.paymentIntent?.status !== "succeeded") {
        setError("Payment not successful.");
        setLoading(false);
        return false;
      }

      const paymentIntent =
        confirmResult.paymentIntent as Stripe.PaymentIntent & {
          metadata: {
            organizationId: string;
            userId: string;
            credits: string;
          };
        };

      // Step 3: Create Guest List Credits
      const createCreditResult = await createGuestListCredit({
        organizationId: paymentIntent.metadata
          .organizationId as Id<"organizations">,
        userId: paymentIntent.metadata.userId as Id<"users">,
        creditsAdded: parseInt(paymentIntent.metadata.credits),
        amountPaid: confirmResult.paymentIntent.amount,
        stripePaymentIntentId: confirmResult.paymentIntent.id,
      });

      if (createCreditResult.status !== "success") {
        setError(
          createCreditResult.error || "Failed to grant guest list credits."
        );
        setLoading(false);
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      setError("An error occurred.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    confirmPayment,
    loading,
    error,
    setError,
    setLoading,
  };
}
