import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useOrganizationConvex() {
  const { organization, isLoaded: isClerkLoaded } = useOrganization();
  const clerkOrganizationId = organization?.id;

  const organizationFromDB = useQuery(
    api.organizations.getOrganizationByClerkId,
    clerkOrganizationId ? { clerkOrganizationId } : "skip"
  );

  const isLoading = !isClerkLoaded || organizationFromDB === undefined;

  return {
    organization,
    organizationFromDB,
    isLoading,
    clerkOrganizationId,
  };
}
