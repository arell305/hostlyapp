import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import GuestListSkeleton from "@/components/shared/skeleton/GuestListSkeleton";
import { ResponseStatus } from "@/types/enums";
import {
  QueryResult,
  TicketSalesByPromoter,
  TicketTotalsItem,
  failure,
  loading,
  success,
} from "@/types/types";
import { CheckInData, PromoterGuestStatsData } from "@/types/convex-types"; // adjust path

export type EventSummaryPayload = {
  promoterGuestStats: Omit<PromoterGuestStatsData, "entries">[];
  checkInData?: CheckInData;
  tickets: TicketSalesByPromoter[];
  ticketTotals: TicketTotalsItem[] | null;
};

// ----- Hook -----
export const useEventSummary = (
  eventId: Id<"events"> | null
): QueryResult<EventSummaryPayload> => {
  const response = useQuery(
    api.tickets.getEventSummary,
    eventId ? { eventId } : "skip"
  );

  if (!response) {
    return loading(<GuestListSkeleton className="mt-4" />);
  }

  if (response.status === ResponseStatus.ERROR || !("data" in response)) {
    return failure(
      <ErrorComponent
        message={`${("error" in response && response.error) || "An error occurred"}.`}
      />
    );
  }

  return success(response.data);
};
