import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, FrontendErrorMessages } from "@/types/enums";
import { Id } from "../../../../../convex/_generated/dataModel";

export const useUpdateOrganizationName = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrganizationName = useAction(api.clerk.updateOrganizationName);

  const updateOrgName = async (
    organizationId: Id<"organizations">,
    name: string
  ): Promise<{ success: boolean; slug?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateOrganizationName({
        organizationId,
        name,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        return { success: true, slug: response.data.slug };
      }
      setError(response.error);
      return { success: false };
    } catch (error) {
      console.error(error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOrgName, isLoading, error, setError };
};
