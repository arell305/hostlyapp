import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, FrontendErrorMessages } from "@/types/enums";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  EventFormInput,
  GuestListFormInput,
  TicketType,
  NormalizedTicketInput,
} from "@/types/types";

export const useAddEvent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addEventAction = useAction(api.events.addEvent);

  const addEvent = async (
    organizationId: Id<"organizations">,
    eventData: EventFormInput,
    ticketData: TicketType[],
    guestListData: GuestListFormInput | null
  ): Promise<{ success: boolean; eventId: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const normalizedTicketData: NormalizedTicketInput[] = ticketData.map(
        (ticket) => ({
          ...ticket,
          description:
            ticket.description?.trim() === ""
              ? null
              : (ticket.description?.trim() ?? null),
        })
      );
      const response = await addEventAction({
        organizationId,
        name: eventData.name,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        photo: eventData.photo,
        address: eventData.address,
        ticketData: normalizedTicketData,
        guestListData,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        return { success: true, eventId: response.data.eventId };
      }

      setError(response.error);
      return { success: false, eventId: "" };
    } catch (err) {
      console.error(err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false, eventId: "" };
    } finally {
      setIsLoading(false);
    }
  };

  return { addEvent, isLoading, error };
};
