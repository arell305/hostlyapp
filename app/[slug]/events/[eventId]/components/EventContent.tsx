"use client";

import { EventSchema, EventTicketTypesSchema } from "@/types/schemas-types";
import { Stripe } from "@stripe/stripe-js";
import { TicketSoldCountByType } from "@/types/types";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import EventDetailsSection from "./EventDetailsSection";
import EventPurchaseSectionWrapper from "./EventPurchaseSectionWrapper";

interface EventContentProps {
  isStripeEnabled: boolean;
  connectedAccountStripeId: string | null;
  stripePromise: Promise<Stripe | null>;
  eventData: EventSchema;
  ticketTypes?: EventTicketTypesSchema[];
  onBrowseMoreEvents: () => void;
  ticketSoldCounts?: TicketSoldCountByType[] | null;
}

const EventContent: React.FC<EventContentProps> = ({
  isStripeEnabled,
  connectedAccountStripeId,
  stripePromise,
  eventData,
  ticketTypes,
  onBrowseMoreEvents,
  ticketSoldCounts,
}) => {
  return (
    <SectionContainer className="flex flex-col  w-full gap-x-10">
      <EventDetailsSection eventData={eventData} />
      <EventPurchaseSectionWrapper
        eventData={eventData}
        ticketTypes={ticketTypes}
        ticketSoldCounts={ticketSoldCounts}
        stripePromise={stripePromise}
        isStripeEnabled={isStripeEnabled}
        connectedAccountStripeId={connectedAccountStripeId}
        onBrowseMoreEvents={onBrowseMoreEvents}
      />
    </SectionContainer>
  );
};

export default EventContent;
