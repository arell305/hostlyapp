import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ResponseStatus, FrontendErrorMessages } from "@/types/enums";
import { Id } from "../../../../../convex/_generated/dataModel";

export const useUpdateOrganizationMetadata = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrganizationMetadata = useAction(
    api.clerk.updateOrganizationMetadata
  );
  const updateOrg = async (
    organizationId: Id<"organizations">,
    params: {
      promoDiscount?: number;
    }
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateOrganizationMetadata({
        organizationId,
        params,
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

  return { updateOrg, isLoading, error, setError };
};
