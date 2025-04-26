import { useMutation } from "convex/react";
import { useState } from "react";
import { ResponseStatus } from "@/types/enums"; // Update if needed
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export const useCancelEvent = () => {
  const cancelEventMutation = useMutation(api.events.cancelEvent);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelEvent = async (eventId: Id<"events">): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cancelEventMutation({ eventId });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(response.error || "Failed to cancel event.");
      return false;
    } catch (err: any) {
      console.error("Cancel event error:", err);
      setError(err.message || "An unexpected error occurred.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { cancelEvent, isLoading, error, setError };
};
