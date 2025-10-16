import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { GuestListEntryWithPromoter } from "@/types/schemas-types";

export const useEventWithGuestLists = (
  eventId: Id<"events"> | null
): GuestListEntryWithPromoter[] | undefined => {
  return useQuery(
    api.guestListEntries.getEventWithGuestLists,
    eventId ? { eventId } : "skip"
  );
};
