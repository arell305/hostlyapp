import { useAction } from "convex/react";
import { useState } from "react";
import { ResponseStatus } from "@/types/enums"; // Adjust path if needed
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type CreateClerkOrgArgs = {
  companyName: string;
  photo: Id<"_storage"> | null;
  promoDiscount: number | null;
};

export const useCreateClerkOrganization = () => {
  const createOrgAction = useAction(api.clerk.createClerkOrganization);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createClerkOrganization = async ({
    companyName,
    photo,
    promoDiscount,
  }: CreateClerkOrgArgs): Promise<{
    slug: string;
    clerkOrganizationId: string;
  } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createOrgAction({
        companyName,
        photo,
        promoDiscount,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        return {
          slug: response.data?.slug,
          clerkOrganizationId: response.data?.clerkOrganizationId,
        };
      }

      setError(response.error);
      return null;
    } catch (err: any) {
      console.error("Create organization error:", err);
      setError(err.message || "An unexpected error occurred.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createClerkOrganization, isLoading, error };
};
