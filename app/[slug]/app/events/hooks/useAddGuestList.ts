import { useMutation } from "convex/react";
import { useState } from "react";
import { ResponseStatus } from "@/types/enums"; // Update if needed
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { GuestEntry } from "@/types/types";

export const useAddGuestList = () => {
  const addGuestListMutation = useMutation(api.guestLists.addGuestList);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGuestList = async (
    eventId: Id<"events">,
    guests: GuestEntry[]
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await addGuestListMutation({ eventId, guests });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(response.error);
      return false;
    } catch (err: any) {
      console.error("Add guest list error:", err);
      setError(err.message || "An unexpected error occurred.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { addGuestList, isLoading, error, setError };
};
