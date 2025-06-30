"use client";

import About from "../../../app/components/view/About";
import OrderReceipt from "@/[slug]/app/components/view/OrderReceipt";
import EmptyList from "@/components/shared/EmptyList";
import TicketSelectorList from "./TicketSelectorList";
import TicketPurchaseSection from "./TicketPurchaseSection";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import { EventSchema, EventTicketTypesSchema } from "@/types/schemas-types";
import { TicketSoldCountByType } from "@/types/types";
import { Stripe } from "@stripe/stripe-js";
import { isTicketSalesOpen } from "@/lib/frontendHelper";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";

interface EventPurchaseSectionWrapperProps {
  eventData: EventSchema;
  ticketTypes?: EventTicketTypesSchema[];
  ticketSoldCounts?: TicketSoldCountByType[] | null;
  stripePromise: Promise<Stripe | null>;
  isStripeEnabled: boolean;
  connectedAccountStripeId: string | null;
  onBrowseMoreEvents: () => void;
}

const EventPurchaseSectionWrapper: React.FC<
  EventPurchaseSectionWrapperProps
> = ({
  eventData,
  ticketTypes,
  ticketSoldCounts,
  stripePromise,
  isStripeEnabled,
  connectedAccountStripeId,
  onBrowseMoreEvents,
}) => {
  const { ticketCounts, clientSecret, paymentSuccess } = useEventCheckout();

  const isTicketsSalesOpen = isTicketSalesOpen(ticketTypes);
  const shouldShowTicketPurchase =
    ticketTypes && ticketTypes.length > 0 && isStripeEnabled && !paymentSuccess;
  const shouldShowPurchaseForm =
    Object.values(ticketCounts).some((count) => count > 0) && !paymentSuccess;
  const shouldShowStripeForm =
    clientSecret && !paymentSuccess && isTicketsSalesOpen;

  return (
    <SectionContainer className="flex flex-col w-full">
      <About description={eventData.description} />
      {paymentSuccess && (
        <OrderReceipt onBrowseMoreEvents={onBrowseMoreEvents} />
      )}
      {!isTicketsSalesOpen && <EmptyList message="Ticket sales are closed" />}

      {shouldShowTicketPurchase && (
        <div className="flex flex-col rounded border shadow mx-auto w-[95%]">
          {!shouldShowStripeForm && ticketTypes && (
            <TicketSelectorList
              ticketTypes={ticketTypes}
              ticketSoldCounts={ticketSoldCounts}
            />
          )}

          <TicketPurchaseSection
            eventId={eventData._id}
            stripePromise={stripePromise}
            isStripeEnabled={isStripeEnabled}
            organizationId={eventData.organizationId as string}
            stripeAccountId={connectedAccountStripeId}
          />
        </div>
      )}
    </SectionContainer>
  );
};

export default EventPurchaseSectionWrapper;
