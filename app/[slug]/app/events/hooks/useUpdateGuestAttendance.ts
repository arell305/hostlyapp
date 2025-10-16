import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { setErrorFromConvexError } from "@/lib/errorHelper";

export const useUpdateGuestAttendance = () => {
  const updateGuestAttendanceMutation = useMutation(
    api.guestListEntries.checkInGuestEntry
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      return await updateGuestAttendanceMutation({
        guestId,
        attended,
        malesInGroup,
        femalesInGroup,
      });
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateGuestAttendance, isLoading, error, setError };
};
