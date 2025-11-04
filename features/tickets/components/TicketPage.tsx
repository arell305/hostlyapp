"use client";

import { Id } from "convex/_generated/dataModel";
import TicketContent from "./TicketContent";
import SubPageContainer from "@shared/ui/containers/SubPageContainer";
import { useTicketsByEventId } from "@/domain/tickets/";

interface TicketPageProps {
  eventId: Id<"events">;
  canCheckInGuests: boolean;
}

const TicketPage: React.FC<TicketPageProps> = ({
  eventId,
  canCheckInGuests,
}) => {
  const result = useTicketsByEventId(eventId);

  if (!result) {
    return;
  }

  return (
    <SubPageContainer>
      <TicketContent tickets={result} canCheckInGuests={canCheckInGuests} />
    </SubPageContainer>
  );
};

export default TicketPage;
