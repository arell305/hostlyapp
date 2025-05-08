import { useMutation } from "convex/react";
import { useState } from "react";
import { ResponseStatus } from "@/types/enums"; // Update this path if needed
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export const useUpdateGuestName = () => {
  const updateGuestNameMutation = useMutation(
    api.guestListEntries.updateGuestListEntry
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGuestName = async (
    guestId: Id<"guestListEntries">,
    newName: string,
    phoneNumber?: string | null
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateGuestNameMutation({
        guestId,
        updates: {
          name: newName,
          phoneNumber,
        },
      });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(response.error || "Failed to update guest name.");
      return false;
    } catch (err: any) {
      console.error("Update guest name error:", err);
      setError(err.message || "An unexpected error occurred.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateGuestName, isLoading, error, setError };
};
