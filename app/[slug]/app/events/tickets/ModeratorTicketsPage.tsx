import React from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import ModeratorTicketsContent from "./ModeratorTicketsContent";
import { api } from "../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";

interface ModeratorTicketsPageProps {
  eventId: Id<"events">;
}

const ModeratorTicketsPage: React.FC<ModeratorTicketsPageProps> = ({
  eventId,
}) => {
  const response = useQuery(api.tickets.getTicketsByEventId, {
    eventId,
  });

  const result = handleQueryState(response);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const tickets = result.data.tickets;
  return <ModeratorTicketsContent tickets={tickets} />;
};

export default ModeratorTicketsPage;
