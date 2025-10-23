import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

export const useDeleteGuestName = () => {
  const deleteGuestNameMutation = useMutation(
    api.guestListEntries.deleteGuestListEntry
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteGuestName = async (
    guestId: Id<"guestListEntries">
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      return await deleteGuestNameMutation({
        guestId,
      });
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteGuestName, isLoading, error, setError };
};
