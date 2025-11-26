"use client";

import { Id } from "convex/_generated/dataModel";
import SubPageContainer from "@shared/ui/containers/SubPageContainer";
import { useMemo, useRef, useState } from "react";
import SearchInput from "@/features/events/components/SearchInput";
import TicketContent from "./TicketContent";
import { TicketSchemaWithPromoter } from "@/shared/types/schemas-types";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import { filterBySearchTerm } from "@/shared/utils/format";

interface TicketPageProps {
  canCheckInGuests: boolean;
  tickets: TicketSchemaWithPromoter[];
}

const TicketPage: React.FC<TicketPageProps> = ({
  canCheckInGuests,
  tickets,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showSearch = tickets.length > SEARCH_MIN_LENGTH;

  const filteredTickets = useMemo(() => {
    return filterBySearchTerm(tickets, searchTerm, (t) => t.ticketUniqueId);
  }, [tickets, searchTerm]);

  return (
    <SubPageContainer>
      {showSearch && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
        />
      )}
      <TicketContent
        tickets={filteredTickets}
        canCheckInGuests={canCheckInGuests}
        searchTerm={searchTerm}
      />
    </SubPageContainer>
  );
};

export default TicketPage;
