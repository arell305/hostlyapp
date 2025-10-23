import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { setErrorFromConvexError } from "@lib/errorHelper";
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
      return await revokeOrganizationInvitation({
        clerkOrgId,
        clerkInvitationId,
        organizationId,
      });
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { revokeInvitation, isLoading, error, setError };
};
