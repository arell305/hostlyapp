import React from "react";
import { useGetEventSummary } from "@/hooks/convex/tickets/useGetEventSummary";
import { Doc } from "convex/_generated/dataModel";
import GuestListSkeleton from "../shared/skeleton/GuestListSkeleton";
import SummaryContent from "@/[slug]/app/events/[eventId]/summary/SummaryContent";

interface GetEventSummaryProps {
  guestListInfo?: Doc<"guestListInfo"> | null;
  ticketInfo?: Doc<"eventTicketTypes">[] | null;
  isPromoter: boolean;
  canEditEvent: boolean;
  event: Doc<"events">;
}

const GetEventSummary = ({
  event,
  guestListInfo,
  ticketInfo,
  isPromoter,
  canEditEvent,
}: GetEventSummaryProps) => {
  const result = useGetEventSummary({ eventId: event._id });

  if (!result) {
    return <GuestListSkeleton className="mt-4" />;
  }

  const { promoterGuestStats, tickets, ticketTotals } = result;

  return (
    <SummaryContent
      isPromoter={isPromoter}
      canEditEvent={canEditEvent}
      guestListInfo={guestListInfo}
      ticketInfo={ticketInfo}
      promoterGuestStats={promoterGuestStats}
      ticketSalesByPromoterData={{
        tickets: tickets,
        ticketTotals: ticketTotals,
      }}
      event={event}
    />
  );
};

export default GetEventSummary;
