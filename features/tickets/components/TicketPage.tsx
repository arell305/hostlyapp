"use client";

import { Id } from "convex/_generated/dataModel";
import SubPageContainer from "@shared/ui/containers/SubPageContainer";
import TicketsLoader from "./TicketsLoader";
import { useRef, useState } from "react";
import SearchInput from "@/features/events/components/SearchInput";

interface TicketPageProps {
  eventId: Id<"events">;
  canCheckInGuests: boolean;
}

const TicketPage: React.FC<TicketPageProps> = ({
  eventId,
  canCheckInGuests,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <SubPageContainer>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search Ticket ID..."
      />
      <TicketsLoader
        eventId={eventId}
        canCheckInGuests={canCheckInGuests}
        searchTerm={searchTerm}
      />
    </SubPageContainer>
  );
};

export default TicketPage;
