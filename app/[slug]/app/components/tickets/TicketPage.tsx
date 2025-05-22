import { QueryState } from "@/types/enums";
import { handleQueryState } from "@/utils/handleQueryState";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React from "react";
import TicketContent from "./TicketContent";
import SubPageContainer from "@/components/shared/containers/SubPageContainer";

interface TicketPageProps {
  eventId: Id<"events">;
  canCheckInGuests: boolean;
}

const TicketPage: React.FC<TicketPageProps> = ({
  eventId,
  canCheckInGuests,
}) => {
  const responseTicketSalesByPromoter = useQuery(
    api.tickets.getTicketsByEventId,
    { eventId }
  );
  const resultTicketSalesByPromoter = handleQueryState(
    responseTicketSalesByPromoter
  );
  if (
    resultTicketSalesByPromoter.type === QueryState.Loading ||
    resultTicketSalesByPromoter.type === QueryState.Error
  ) {
    return resultTicketSalesByPromoter.element;
  }
  return (
    <SubPageContainer>
      <TicketContent
        tickets={resultTicketSalesByPromoter.data?.tickets}
        canCheckInGuests={canCheckInGuests}
      />
    </SubPageContainer>
  );
};

export default TicketPage;
