"use client";

import { Id } from "convex/_generated/dataModel";
import TicketContent from "./TicketContent";
import { useTicketsByEventId } from "@/domain/tickets/";

interface TicketsLoaderProps {
  eventId: Id<"events">;
  canCheckInGuests: boolean;
  searchTerm: string;
}

const TicketsLoader: React.FC<TicketsLoaderProps> = ({
  eventId,
  canCheckInGuests,
  searchTerm,
}) => {
  const result = useTicketsByEventId(eventId);

  if (!result) {
    return;
  }

  return (
    <TicketContent
      tickets={result}
      canCheckInGuests={canCheckInGuests}
      searchTerm={searchTerm}
    />
  );
};

export default TicketsLoader;
