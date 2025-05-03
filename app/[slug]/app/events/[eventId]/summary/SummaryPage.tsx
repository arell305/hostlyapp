import {
  GuestListInfoSchema,
  TicketInfoSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import React from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { handleQueryState } from "../../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import { Promoter } from "@/types/types";
import SummaryContent from "./SummaryContent";

interface SummaryPageProps {
  guestListInfo?: GuestListInfoSchema | null;
  ticketData?: TicketInfoSchema | null;
  tickets: TicketSchemaWithPromoter[];
  organizationId: Id<"organizations">;
  isPromoter: boolean;
  eventId: Id<"events">;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  guestListInfo,
  ticketData,
  tickets,
  organizationId,
  isPromoter,
  eventId,
}) => {
  const responsePromoters = useQuery(
    api.organizations.getPromotersByOrg,
    isPromoter ? "skip" : { organizationId }
  );

  const responseGuestList = useQuery(
    api.guestLists.getGuestListByPromoter,
    !isPromoter ? "skip" : { eventId }
  );

  const responsePromoterTicketData = useQuery(
    api.tickets.getTicketsByClerkUser,
    !isPromoter ? "skip" : { eventId }
  );

  const resultPromoters = handleQueryState(responsePromoters);
  const resultGuestList = handleQueryState(responseGuestList);
  const resultPromoterTicketData = handleQueryState(responsePromoterTicketData);
  // Skip loading/error UI if the user is a promoter (query was skipped)
  if (
    !isPromoter &&
    (resultPromoters.type === QueryState.Loading ||
      resultPromoters.type === QueryState.Error)
  ) {
    return resultPromoters.element;
  }

  if (
    isPromoter &&
    (resultGuestList.type === QueryState.Loading ||
      resultGuestList.type === QueryState.Error)
  ) {
    return resultGuestList.element;
  }

  if (
    isPromoter &&
    (resultPromoterTicketData.type === QueryState.Loading ||
      resultPromoterTicketData.type === QueryState.Error)
  ) {
    return resultPromoterTicketData.element;
  }
  const promoters: Promoter[] =
    isPromoter || resultPromoters.type !== QueryState.Success
      ? []
      : resultPromoters.data.promoters;

  const guestListResults =
    isPromoter && resultGuestList.type === QueryState.Success
      ? resultGuestList.data
      : null;

  const promoterTicketData =
    isPromoter && resultPromoterTicketData.type === QueryState.Success
      ? resultPromoterTicketData.data.ticketCounts
      : null;

  return (
    <SummaryContent
      guestListInfo={guestListInfo}
      ticketData={ticketData}
      tickets={tickets}
      promoters={promoters}
      isPromoter={isPromoter}
      guestListResults={guestListResults}
      promoterTicketData={promoterTicketData}
    />
  );
};

export default SummaryPage;
