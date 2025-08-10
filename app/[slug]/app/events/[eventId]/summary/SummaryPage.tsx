import React from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import {
  EventSchema,
  EventTicketTypesSchema,
  GuestListInfoSchema,
} from "@/types/schemas-types";
import SummaryContent from "./SummaryContent";
import { isError, isLoading } from "@/types/types";
import { useEventSummary } from "../../hooks/useEventSummary";

interface SummaryPageProps {
  guestListInfo?: GuestListInfoSchema | null;
  ticketInfo?: EventTicketTypesSchema[] | null;
  isPromoter: boolean;
  canEditEvent: boolean;
  event: EventSchema;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  isPromoter,
  guestListInfo,
  ticketInfo,
  canEditEvent,
  event,
}) => {
  const result = useEventSummary(event._id);

  if (isLoading(result) || isError(result)) {
    return result.component;
  }

  const { promoterGuestStats, tickets, ticketTotals } = result.data;

  return (
    <SummaryContent
      isPromoter={isPromoter}
      canEditEvent={canEditEvent}
      guestListInfo={guestListInfo}
      ticketInfo={ticketInfo}
      promoterGuestStats={promoterGuestStats}
      ticketSalesByPromoterData={{ tickets: tickets, ticketTotals }}
      event={event}
    />
  );
};

export default SummaryPage;
