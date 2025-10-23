"use client";

import { Stripe } from "@stripe/stripe-js";
import SectionContainer from "@shared/ui/containers/SectionContainer";
import EventDetailsSection from "./EventDetailsSection";
import EventPurchaseSectionWrapper from "./EventPurchaseSectionWrapper";

interface EventContentProps {
  isStripeEnabled: boolean;
  connectedAccountStripeId: string | null;
  stripePromise: Promise<Stripe | null>;
  onBrowseMoreEvents: () => void;
}

const EventContent: React.FC<EventContentProps> = ({
  isStripeEnabled,
  connectedAccountStripeId,
  stripePromise,
  onBrowseMoreEvents,
}) => {
  return (
    <SectionContainer className="flex flex-col  w-full gap-x-10">
      <EventDetailsSection />
      <EventPurchaseSectionWrapper
        stripePromise={stripePromise}
        isStripeEnabled={isStripeEnabled}
        connectedAccountStripeId={connectedAccountStripeId}
        onBrowseMoreEvents={onBrowseMoreEvents}
      />
    </SectionContainer>
  );
};

export default EventContent;
