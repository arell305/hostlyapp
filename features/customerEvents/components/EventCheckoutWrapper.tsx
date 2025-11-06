"use client";

import { EventCheckoutProvider } from "@/contexts/EventCheckoutContext";
import { Stripe } from "@stripe/stripe-js";
import EventContent from "./EventContent";
import { useEventContext } from "@/shared/hooks/contexts";

interface EventContentWrapperProps {
  isStripeEnabled: boolean;
  connectedAccountStripeId: string | null;
  stripePromise: Promise<Stripe | null>;
  onBrowseMoreEvents: () => void;
}

const EventContentWrapper: React.FC<EventContentWrapperProps> = ({
  isStripeEnabled,
  connectedAccountStripeId,
  stripePromise,
  onBrowseMoreEvents,
}) => {
  const { ticketTypes } = useEventContext();
  return (
    <EventCheckoutProvider ticketTypes={ticketTypes}>
      <EventContent
        isStripeEnabled={isStripeEnabled}
        connectedAccountStripeId={connectedAccountStripeId}
        stripePromise={stripePromise}
        onBrowseMoreEvents={onBrowseMoreEvents}
      />
    </EventCheckoutProvider>
  );
};

export default EventContentWrapper;
