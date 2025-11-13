"use client";

import React, { useCallback } from "react";
import OrderSummary from "@/[slug]/app/components/view/OrderSummary";
import StripePaymentSection from "./StripePaymentSection";
import TicketCheckoutForm from "./TicketCheckoutForm";
import { Stripe } from "@stripe/stripe-js";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import { useCreatePaymentIntent } from "../../hooks/useCreatePaymentIntent";
import { FrontendErrorMessages } from "@/types/enums";
import { useEventContext } from "@/contexts/EventContext";

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

  const { event } = useEventContext();

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

    const ticketsPart = (pricing.perTicketPrices ?? [])
      .filter((t) => t.quantity > 0)
      .map((t) => `${t.ticketType.name} x${t.quantity}`)
      .join(", ");

    const description = [
      event.name,
      email,
      ticketsPart,
      promoCode ? `Promo: ${promoCode}` : null,
    ]
      .filter(Boolean)
      .join(" • ");
    const clientSecret = await createPaymentIntent(
      pricing.totalPrice,
      stripeAccountId,
      description,
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
    pricing.perTicketPrices,
    stripeAccountId,
    eventId,
    organizationId,
    ticketCounts,
    createPaymentIntent,
    setClientSecret,
    setEmailError,
    setError,
    event.name,
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
