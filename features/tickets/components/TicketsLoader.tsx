"use client";

import { Id } from "convex/_generated/dataModel";
import { useTicketsByEventId } from "@/domain/tickets/";
import TicketsSkeleton from "@/shared/ui/skeleton/TicketsSkeleton";
import TicketPage from "./TicketPage";

interface TicketsLoaderProps {
  eventId: Id<"events">;
  canCheckInGuests: boolean;
}

const TicketsLoader: React.FC<TicketsLoaderProps> = ({
  eventId,
  canCheckInGuests,
}) => {
  const result = useTicketsByEventId(eventId);

  if (!result) {
    return <TicketsSkeleton className="mt-4" />;
  }

  return <TicketPage canCheckInGuests={canCheckInGuests} tickets={result} />;
};

export default TicketsLoader;
