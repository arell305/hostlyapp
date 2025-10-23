"use client";

import { Id } from "convex/_generated/dataModel";
import TicketContent from "./TicketContent";
import SubPageContainer from "@shared/ui/containers/SubPageContainer";
import { useTicketsByEventId } from "@/domain/tickets/";
import FullLoading from "@/shared/ui/loading/FullLoading";

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
    return <FullLoading />;
  }

  return (
    <SubPageContainer>
      <TicketContent tickets={result} canCheckInGuests={canCheckInGuests} />
    </SubPageContainer>
  );
};

export default TicketPage;
