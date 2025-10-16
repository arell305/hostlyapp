import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/lib/errorHelper";

export const useUpdateGuestName = () => {
  const updateGuestNameMutation = useMutation(
    api.guestListEntries.updateGuestListEntry
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateGuestName = async (
    guestId: Id<"guestListEntries">,
    newName: string,
    phoneNumber?: string | null
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      return await updateGuestNameMutation({
        guestId,
        updates: {
          name: newName,
          phoneNumber,
        },
      });
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateGuestName, isLoading, error, setError };
};
