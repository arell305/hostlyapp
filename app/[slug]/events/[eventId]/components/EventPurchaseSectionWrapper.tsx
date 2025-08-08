"use client";

import About from "../../../app/components/view/About";
import OrderReceipt from "@/[slug]/app/components/view/OrderReceipt";
import TicketSelectorList from "./TicketSelectorList";
import TicketPurchaseSection from "./TicketPurchaseSection";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import { Stripe } from "@stripe/stripe-js";
import { isTicketSalesOpen } from "@/lib/frontendHelper";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import { useEventContext } from "@/contexts/EventContext";

interface EventPurchaseSectionWrapperProps {
  stripePromise: Promise<Stripe | null>;
  isStripeEnabled: boolean;
  connectedAccountStripeId: string | null;
  onBrowseMoreEvents: () => void;
}

const EventPurchaseSectionWrapper: React.FC<
  EventPurchaseSectionWrapperProps
> = ({
  stripePromise,
  isStripeEnabled,
  connectedAccountStripeId,
  onBrowseMoreEvents,
}) => {
  const { clientSecret, paymentSuccess } = useEventCheckout();
  const { event: eventData, ticketTypes, ticketSoldCounts } = useEventContext();

  const isTicketsSalesOpen = isTicketSalesOpen(ticketTypes);
  const shouldShowTicketPurchase =
    ticketTypes && ticketTypes.length > 0 && isStripeEnabled && !paymentSuccess;
  const shouldShowStripeForm =
    clientSecret && !paymentSuccess && isTicketsSalesOpen;

  return (
    <SectionContainer className="flex flex-col w-full pb-0">
      <About description={eventData.description} />
      {paymentSuccess && (
        <OrderReceipt onBrowseMoreEvents={onBrowseMoreEvents} />
      )}

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
