import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useUsersByOrgForMod(
  organizationId: Id<"organizations">
): Doc<"users">[] | undefined {
  return useQuery(api.organizations.getUsersByOrgForMod, { organizationId });
}
