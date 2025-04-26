import React from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import ManagerTicketsContent from "./ManagerTicketsContent";
import {
  TicketInfoSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import { Promoter } from "@/types/types";

interface ManagerTicketsPageProps {
  eventId: Id<"events">;
  organizationId: Id<"organizations">;
  ticketData: TicketInfoSchema;
  isTicketsSalesOpen: boolean;
}

const ManagerTicketsPage: React.FC<ManagerTicketsPageProps> = ({
  eventId,
  organizationId,
  ticketData,
  isTicketsSalesOpen,
}) => {
  const responsePromoters = useQuery(api.organizations.getPromotersByOrg, {
    organizationId,
  });
  const responseTickets = useQuery(api.tickets.getTicketsByEventId, {
    eventId,
  });

  const resultPromoters = handleQueryState(responsePromoters);

  if (
    resultPromoters.type === QueryState.Loading ||
    resultPromoters.type === QueryState.Error
  ) {
    return resultPromoters.element;
  }

  const resultTickets = handleQueryState(responseTickets);

  if (
    resultTickets.type === QueryState.Loading ||
    resultTickets.type === QueryState.Error
  ) {
    return resultTickets.element;
  }

  const promoters: Promoter[] = resultPromoters.data.promoters;
  const tickets: TicketSchemaWithPromoter[] = resultTickets.data.tickets;

  return (
    <ManagerTicketsContent
      promoters={promoters}
      tickets={tickets}
      isTicketsSalesOpen={isTicketsSalesOpen}
      ticketData={ticketData}
    />
  );
};
export default ManagerTicketsPage;
