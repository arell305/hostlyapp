"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";

export function useUsersByOrganization(
  organizationId: Id<"organizations">,
  isActive: boolean
): Doc<"users">[] | undefined {
  return useQuery(api.organizations.getUsersByOrganization, {
    organizationId,
    isActive,
  });
}
