import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/lib/errorHelper";

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
      return await addPublicEntry({ eventId, name, phoneNumber });
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { addEntry, isLoading, error, setError };
};
