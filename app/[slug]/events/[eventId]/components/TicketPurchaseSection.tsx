"use client";

import React, { useCallback } from "react";
import OrderSummary from "@/[slug]/app/components/view/OrderSummary";
import StripePaymentSection from "./StripePaymentSection";
import TicketCheckoutForm from "./TicketCheckoutForm";
import { Stripe } from "@stripe/stripe-js";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import { useCreatePaymentIntent } from "../../hooks/useCreatePaymentIntent";
import { FrontendErrorMessages } from "@/types/enums";

interface TicketPurchaseSectionProps {
  eventId: string;
  organizationId: string;
  stripePromise: Promise<Stripe | null>;
  stripeAccountId: string | null;
  isStripeEnabled: boolean;
}

const TicketPurchaseSection: React.FC<TicketPurchaseSectionProps> = ({
  eventId,
  organizationId,
  stripePromise,
  stripeAccountId,
  isStripeEnabled,
}) => {
  const {
    ticketCounts,
    email,
    promoCode,
    pricing,
    paymentSuccess,
    setClientSecret,
    setEmailError,
  } = useEventCheckout();

  const {
    createPaymentIntent,
    clientSecret,
    isLoading: isCheckoutLoading,
    error: checkoutError,
    setError,
  } = useCreatePaymentIntent();

  const handleCheckout = useCallback(async () => {
    if (!email || !email.includes("@")) {
      setEmailError("Valid email required");
      return;
    }
    if (!stripeAccountId) {
      setError(FrontendErrorMessages.GENERIC_ERROR);
      console.log("stripe accountId not found");
      return;
    }

    const ticketTypes = Object.entries(ticketCounts)
      .filter(([, quantity]) => quantity > 0)
      .map(([eventTicketTypeId, quantity]) => ({
        eventTicketTypeId,
        quantity,
      }));

    const clientSecret = await createPaymentIntent(
      pricing.totalPrice,
      stripeAccountId,
      {
        eventId,
        promoCode,
        email,
        organizationId,
        ticketTypes,
      }
    );

    if (clientSecret) setClientSecret(clientSecret);
  }, [
    email,
    promoCode,
    pricing.totalPrice,
    stripeAccountId,
    eventId,
    organizationId,
    ticketCounts,
    createPaymentIntent,
    setClientSecret,
    setEmailError,
  ]);

  const shouldShowPurchaseForm =
    Object.values(ticketCounts).some((count) => count > 0) && !paymentSuccess;

  const shouldShowStripeForm =
    clientSecret && !paymentSuccess && isStripeEnabled;

  if (!shouldShowPurchaseForm) return null;

  return (
    <>
      <OrderSummary />
      {shouldShowStripeForm ? (
        <StripePaymentSection stripePromise={stripePromise} />
      ) : (
        <TicketCheckoutForm
          eventId={eventId}
          isCheckoutLoading={isCheckoutLoading}
          checkoutError={checkoutError}
          onCheckout={handleCheckout}
        />
      )}
    </>
  );
};

export default TicketPurchaseSection;
