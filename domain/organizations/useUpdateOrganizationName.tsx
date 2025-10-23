import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { setErrorFromConvexError } from "@shared/lib/errorHelper";

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

      return { success: true, slug: response.slug };
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOrgName, isLoading, error, setError };
};
