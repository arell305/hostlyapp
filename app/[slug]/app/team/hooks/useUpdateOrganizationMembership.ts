import { useAction } from "convex/react";
import { useState } from "react";
import { FrontendErrorMessages, ResponseStatus, UserRole } from "@/types/enums";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export const useUpdateOrganizationMembership = () => {
  const updateOrgMembership = useAction(
    api.clerk.updateOrganizationMemberships
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrganizationMembership = async (
    userId: Id<"users">,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateOrgMembership({ userId, role });

      if (result.status === ResponseStatus.SUCCESS) {
        return true;
      }

      setError(result.error || FrontendErrorMessages.GENERIC_ERROR);
      return false;
    } catch (err) {
      console.error(err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateOrganizationMembership,
    isLoading,
    error,
    setError,
  };
};
