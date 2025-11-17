import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import {
  EventFormInput,
  GuestListFormInput,
  NormalizedTicketInput,
  TicketUpdateInput,
} from "@shared/types/types";
import { setErrorFromConvexError } from "@shared/lib/errorHelper";

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
      const normalizedTicketData: NormalizedTicketInput[] =
        updatedTicketData.map((ticket) => ({
          ...ticket,
          description:
            ticket.description?.trim() === ""
              ? null
              : ticket.description?.trim() ?? null,
        }));

      return await updateEventMutation({
        organizationId,
        ...updatedEventData,
        ticketData: normalizedTicketData,
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
