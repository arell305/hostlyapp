import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  EventFormInput,
  GuestListFormInput,
  TicketUpdateInput,
} from "@/types/types";
import { setErrorFromConvexError } from "@/lib/errorHelper";

export const useUpdateEvent = () => {
  const updateEventMutation = useAction(api.events.updateEvent);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateEvent = async (
    organizationId: Id<"organizations">,
    updatedEventData: EventFormInput,
    updatedTicketData: TicketUpdateInput[],
    updatedGuestListData: GuestListFormInput | null,
    eventId: Id<"events">
  ): Promise<Boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      return await updateEventMutation({
        organizationId,
        ...updatedEventData,
        ticketData: updatedTicketData,
        guestListData: updatedGuestListData,
        eventId,
      });
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return false;
    }
  };

  return { updateEvent, isLoading, error, setError };
};
