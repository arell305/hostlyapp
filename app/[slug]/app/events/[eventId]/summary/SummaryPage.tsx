import { GuestListInfoSchema, TicketInfoSchema } from "@/types/schemas-types";
import React from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { handleQueryState } from "../../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import SummaryContent from "./SummaryContent";

interface SummaryPageProps {
  guestListInfo?: GuestListInfoSchema | null;
  ticketInfo?: TicketInfoSchema | null;
  isPromoter: boolean;
  eventId: Id<"events">;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  isPromoter,
  eventId,
  guestListInfo,
  ticketInfo,
}) => {
  const responsePromoterGuestStats = useQuery(
    api.guestListEntries.getPromoterGuestStats,
    !guestListInfo ? "skip" : { eventId }
  );

  const responseTicketSalesByPromoter = useQuery(
    api.tickets.getTicketSalesByPromoterWithDetails,
    !ticketInfo ? "skip" : { eventId }
  );

  const resultPromoterGuestStats = handleQueryState(responsePromoterGuestStats);
  const resultTicketSalesByPromoter = handleQueryState(
    responseTicketSalesByPromoter
  );
  if (
    guestListInfo &&
    (resultPromoterGuestStats.type === QueryState.Loading ||
      resultPromoterGuestStats.type === QueryState.Error)
  ) {
    return resultPromoterGuestStats.element;
  }

  if (
    ticketInfo &&
    (resultTicketSalesByPromoter.type === QueryState.Loading ||
      resultTicketSalesByPromoter.type === QueryState.Error)
  ) {
    return resultTicketSalesByPromoter.element;
  }

  const promoterGuestStatsData =
    resultPromoterGuestStats.type === QueryState.Success
      ? resultPromoterGuestStats.data
      : null;
  const ticketSalesByPromoterData =
    resultTicketSalesByPromoter.type === QueryState.Success
      ? resultTicketSalesByPromoter.data
      : null;

  return (
    <SummaryContent
      isPromoter={isPromoter}
      guestListInfo={guestListInfo}
      ticketInfo={ticketInfo}
      promoterGuestStatsData={promoterGuestStatsData}
      ticketSalesByPromoterData={ticketSalesByPromoterData}
    />
  );
};

export default SummaryPage;
