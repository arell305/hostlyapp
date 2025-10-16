import { Id } from "convex/_generated/dataModel";
import React from "react";
import TicketContent from "./TicketContent";
import SubPageContainer from "@/components/shared/containers/SubPageContainer";
import { useTicketsByEventId } from "@/hooks/convex/tickets/useTicketsByEventId";
import FullLoading from "../loading/FullLoading";

interface TicketPageProps {
  eventId: Id<"events">;
  canCheckInGuests: boolean;
}

const TicketPage: React.FC<TicketPageProps> = ({
  eventId,
  canCheckInGuests,
}) => {
  const tickets = useTicketsByEventId(eventId);

  if (!tickets) {
    return <FullLoading />;
  }

  return (
    <SubPageContainer>
      <TicketContent tickets={tickets} canCheckInGuests={canCheckInGuests} />
    </SubPageContainer>
  );
};

export default TicketPage;
