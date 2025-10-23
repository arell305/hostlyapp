import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { UserRole } from "@/shared/types/enums";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

export const useInviteUser = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createClerkInvitation = useAction(api.clerk.createClerkInvitation);

  const inviteUser = async (
    clerkOrgId: string,
    role: UserRole,
    email: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      return await createClerkInvitation({
        clerkOrgId,
        email,
        role,
      });
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { inviteUser, isLoading, error, setError };
};
