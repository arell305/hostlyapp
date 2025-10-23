import { useAction } from "convex/react";
import { useState } from "react";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

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

      return response;
    } catch (error) {
      setErrorFromConvexError(error, setError);
      return null;
    }
  };

  return { createClerkOrganization, isLoading, error, setError };
};
