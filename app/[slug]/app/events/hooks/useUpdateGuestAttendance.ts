import { useMutation } from "convex/react";
import { useState } from "react";
import { ResponseStatus } from "@/types/enums"; // Update path if needed
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export const useUpdateGuestAttendance = () => {
  const updateGuestAttendanceMutation = useMutation(
    api.guestListEntries.checkInGuestEntry
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGuestAttendance = async (
    guestId: Id<"guestListEntries">,
    malesInGroup: number,
    femalesInGroup: number,
    attended: boolean
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateGuestAttendanceMutation({
        guestId,
        attended,
        malesInGroup,
        femalesInGroup,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError("Failed to update guest attendance.");
      return false;
    } catch (err: any) {
      console.error("Update guest attendance error:", err);
      setError(err.message || "An unexpected error occurred.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateGuestAttendance, isLoading, error, setError };
};
