import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { TicketSchemaWithPromoter } from "@/shared/types/schemas-types";

export const useTicketsByEventId = (
  eventId: Id<"events">
): TicketSchemaWithPromoter[] | undefined => {
  return useQuery(api.tickets.getTicketsByEventId, { eventId });
};
