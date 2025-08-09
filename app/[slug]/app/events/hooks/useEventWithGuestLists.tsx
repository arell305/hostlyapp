import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import GuestListSkeleton from "@/components/shared/skeleton/GuestListSkeleton";
import { ResponseStatus } from "@/types/enums";
import { GuestListEntryWithPromoter } from "@/types/schemas-types";
import { QueryResult } from "@/types/types";
import { failure, loading, success } from "@/types/types";

export const useEventWithGuestLists = (
  eventId: Id<"events"> | null
): QueryResult<GuestListEntryWithPromoter[]> => {
  const response = useQuery(
    api.guestListEntries.getEventWithGuestLists,
    eventId ? { eventId } : "skip"
  );

  if (!response) {
    return loading(<GuestListSkeleton className="mt-4" />);
  }

  if (response?.status === ResponseStatus.ERROR || !response?.data) {
    return failure(
      <ErrorComponent message={`${response?.error || "An error occurred"}.`} />
    );
  }

  return success(response.data.guests);
};
