import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/lib/errorHelper";

export const useCancelEvent = () => {
  const cancelEventMutation = useMutation(api.events.cancelEvent);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cancelEvent = async (eventId: Id<"events">): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      return await cancelEventMutation({ eventId });
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { cancelEvent, isLoading, error, setError };
};
