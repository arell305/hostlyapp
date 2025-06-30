"use client";

import React from "react";
import { EventCheckoutProvider } from "@/contexts/EventCheckoutContext";
import { EventSchema, EventTicketTypesSchema } from "@/types/schemas-types";
import { TicketSoldCountByType } from "@/types/types";
import { Stripe } from "@stripe/stripe-js";
import EventContent from "./EventContent";

interface EventContentWrapperProps {
  isStripeEnabled: boolean;
  connectedAccountStripeId: string | null;
  stripePromise: Promise<Stripe | null>;
  eventData: EventSchema;
  ticketTypes: EventTicketTypesSchema[];
  ticketSoldCounts?: TicketSoldCountByType[] | null;
  onBrowseMoreEvents: () => void;
}

const EventContentWrapper: React.FC<EventContentWrapperProps> = ({
  isStripeEnabled,
  connectedAccountStripeId,
  stripePromise,
  eventData,
  ticketTypes,
  ticketSoldCounts,
  onBrowseMoreEvents,
}) => {
  return (
    <EventCheckoutProvider
      ticketTypes={ticketTypes}
      ticketSoldCounts={ticketSoldCounts}
    >
      <EventContent
        isStripeEnabled={isStripeEnabled}
        connectedAccountStripeId={connectedAccountStripeId}
        stripePromise={stripePromise}
        eventData={eventData}
        ticketTypes={ticketTypes}
        ticketSoldCounts={ticketSoldCounts}
        onBrowseMoreEvents={onBrowseMoreEvents}
      />
    </EventCheckoutProvider>
  );
};

export default EventContentWrapper;
