import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { handleQueryState } from "../../../../../utils/handleQueryState";
import { QueryState } from "@/types/enums";
import PromoterTicketsContent from "./PromoterTicketsContent";

interface PromoterTicketsPageProps {
  eventId: Id<"events">;
}

const PromoterTicketsPage = ({ eventId }: PromoterTicketsPageProps) => {
  const response = useQuery(api.tickets.getTicketsByClerkUser, {
    eventId,
  });

  const result = handleQueryState(response);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const ticketCounts = result.data.ticketCounts;

  return <PromoterTicketsContent ticketCounts={ticketCounts} />;
};

export default PromoterTicketsPage;
