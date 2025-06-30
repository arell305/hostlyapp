import { useState } from "react";
import { useMutation } from "convex/react";
import { ResponseStatus, FrontendErrorMessages } from "@/types/enums";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export const useAddPublicGuestListEntry = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addPublicEntry = useMutation(
    api.guestListEntries.addPublicGuestListEntry
  );

  const addEntry = async (
    eventId: Id<"events">,
    name: string,
    phoneNumber: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await addPublicEntry({ eventId, name, phoneNumber });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(response.error || FrontendErrorMessages.GENERIC_ERROR);
      return false;
    } catch (err) {
      console.error(err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { addEntry, isLoading, error, setError };
};
