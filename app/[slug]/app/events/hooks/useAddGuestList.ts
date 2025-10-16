import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { GuestEntry } from "@/types/types";
import { setErrorFromConvexError } from "@/lib/errorHelper";

export const useAddGuestList = () => {
  const addGuestListMutation = useMutation(
    api.guestListEntries.addGuestListEntry
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addGuestList = async (
    eventId: Id<"events">,
    guests: GuestEntry[]
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      return await addGuestListMutation({ eventId, guests });
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { addGuestList, isLoading, error, setError };
};
