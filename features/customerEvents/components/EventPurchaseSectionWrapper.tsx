"use client";

import About from "@/features/customerEvents/components/view/About";
import OrderReceipt from "@/features/customerEvents/components/view/OrderReceipt";
import TicketSelectorList from "./TicketSelectorList";
import TicketPurchaseSection from "./TicketPurchaseSection";
import SectionContainer from "@shared/ui/containers/SectionContainer";
import { Stripe } from "@stripe/stripe-js";
import { isTicketSalesOpen } from "@shared/lib/frontendHelper";
import { useEventContext, useEventCheckout } from "@/shared/hooks/contexts";

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
