import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { setErrorFromConvexError } from "@shared/lib/errorHelper";

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
      return await updateOrganizationMetadata({
        organizationId,
        params,
      });
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateOrg, isLoading, error, setError };
};
