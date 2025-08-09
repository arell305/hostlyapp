import { QueryState } from "@/types/enums";
import { handleQueryState } from "@/utils/handleQueryState";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React from "react";
import TicketContent from "./TicketContent";
import SubPageContainer from "@/components/shared/containers/SubPageContainer";
import { useTicketsByEventId } from "../../events/hooks/useTicketsByEventId";
import { isError, isLoading } from "@/types/types";

interface TicketPageProps {
  eventId: Id<"events">;
  canCheckInGuests: boolean;
}

const TicketPage: React.FC<TicketPageProps> = ({
  eventId,
  canCheckInGuests,
}) => {
  const result = useTicketsByEventId(eventId);
  if (isLoading(result) || isError(result)) {
    return result.component;
  }
  const tickets = result.data;

  return (
    <SubPageContainer>
      <TicketContent tickets={tickets} canCheckInGuests={canCheckInGuests} />
    </SubPageContainer>
  );
};

export default TicketPage;
