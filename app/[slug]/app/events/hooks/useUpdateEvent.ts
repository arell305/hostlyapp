import { useAction } from "convex/react";
import { ResponseStatus } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  EventFormInput,
  GuestListFormInput,
  TicketFormInput,
} from "@/types/types";

export const useUpdateEvent = () => {
  const updateEventMutation = useAction(api.events.updateEvent);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateEvent = async (
    organizationId: Id<"organizations">,
    updatedEventData: EventFormInput,
    updatedTicketData: TicketFormInput | null,
    updatedGuestListData: GuestListFormInput | null,
    eventId: Id<"events">
  ): Promise<Boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateEventMutation({
        organizationId,
        ...updatedEventData,
        ticketData: updatedTicketData,
        guestListData: updatedGuestListData,
        eventId,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(response.error);
      return false;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateEvent, isLoading, error };
};
