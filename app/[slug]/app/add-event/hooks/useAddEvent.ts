import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { EventFormInput, GuestListFormInput, TicketType } from "@/types/types";
import { setErrorFromConvexError } from "@/lib/errorHelper";

export const useAddEvent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addEventAction = useAction(api.events.addEvent);

  const addEvent = async (
    organizationId: Id<"organizations">,
    eventData: EventFormInput,
    ticketData: TicketType[],
    guestListData: GuestListFormInput | null
  ): Promise<{ success: boolean; eventId?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await addEventAction({
        organizationId,
        name: eventData.name,
        description: eventData.description,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        photo: eventData.photo,
        address: eventData.address,
        ticketData,
        guestListData,
      });

      return { success: true, eventId: response };
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return { success: false };
    }
  };

  return { addEvent, isLoading, error };
};
