import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import GuestListSkeleton from "@/components/shared/skeleton/GuestListSkeleton";
import { ResponseStatus } from "@/types/enums";
import { failure, loading, QueryResult, success } from "@/types/types";
import { PromoterTicketSalesByType } from "@/types/convex-types";

export const usePromoterTicketSalesByType = (
  eventId: Id<"events"> | null
): QueryResult<PromoterTicketSalesByType[]> => {
  const response = useQuery(
    api.tickets.getPromoterTicketSalesByType,
    eventId ? { eventId } : "skip"
  );

  if (!response) {
    return loading(<GuestListSkeleton />);
  }

  if (response.status === ResponseStatus.ERROR || !response.data) {
    return failure(
      <ErrorComponent message={`${response.error || "An error occurred"}.`} />
    );
  }

  return success(response.data);
};
