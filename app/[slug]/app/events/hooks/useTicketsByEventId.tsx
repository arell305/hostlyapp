import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import GuestListSkeleton from "@/components/shared/skeleton/GuestListSkeleton";
import { ResponseStatus } from "@/types/enums";
import { QueryResult, failure, loading, success } from "@/types/types";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";

export const useTicketsByEventId = (
  eventId: Id<"events"> | null
): QueryResult<TicketSchemaWithPromoter[]> => {
  const response = useQuery(
    api.tickets.getTicketsByEventId,
    eventId ? { eventId } : "skip"
  );

  if (!response) {
    return loading(<GuestListSkeleton className="mt-4" />);
  }

  if (response.status === ResponseStatus.ERROR || !response.data) {
    return failure(
      <ErrorComponent message={`${response?.error || "An error occurred"}.`} />
    );
  }

  return success(response.data.tickets);
};
