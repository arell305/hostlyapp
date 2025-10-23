"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { OrganizationDetails } from "@shared/types/types";

export function useGetAllOrganizations(): OrganizationDetails[] | undefined {
  return useQuery(api.organizations.getAllOrganizations, {});
}
