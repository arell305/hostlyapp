import React from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import ManagerTicketsContent from "./ManagerTicketsContent";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";

interface ManagerTicketsPageProps {
  eventId: Id<"events">;
}

const ManagerTicketsPage: React.FC<ManagerTicketsPageProps> = ({ eventId }) => {
  const responseTickets = useQuery(api.tickets.getTicketsByEventId, {
    eventId,
  });

  const resultTickets = handleQueryState(responseTickets);

  if (
    resultTickets.type === QueryState.Loading ||
    resultTickets.type === QueryState.Error
  ) {
    return resultTickets.element;
  }

  const tickets: TicketSchemaWithPromoter[] = resultTickets.data.tickets;

  return <ManagerTicketsContent tickets={tickets} />;
};
export default ManagerTicketsPage;
