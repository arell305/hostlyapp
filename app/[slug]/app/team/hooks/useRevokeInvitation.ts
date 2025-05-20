import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, FrontendErrorMessages } from "@/types/enums";
import { Id } from "../../../../../convex/_generated/dataModel";
export const useRevokeInvitation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const revokeOrganizationInvitation = useAction(
    api.clerk.revokeOrganizationInvitation
  );

  const revokeInvitation = async (
    clerkOrgId: string,
    clerkInvitationId: string,
    organizationId: Id<"organizations">
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await revokeOrganizationInvitation({
        clerkOrgId,
        clerkInvitationId,
        organizationId,
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

  return { revokeInvitation, isLoading, error, setError };
};
