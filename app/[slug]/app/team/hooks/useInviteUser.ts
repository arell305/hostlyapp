import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, UserRole, FrontendErrorMessages } from "@/types/enums";

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
      const response = await createClerkInvitation({
        clerkOrgId,
        email,
        role,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        return true;
      }
      setError(response.error);
      return false;
    } catch (error) {
      console.error(error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { inviteUser, isLoading, error };
};
