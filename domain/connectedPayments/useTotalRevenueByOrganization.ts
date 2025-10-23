"use client";

import { useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { GetTotalRevenueByOrganizationData } from "@shared/types/convex-types";

type TotalRevenueByOrganizationParams = {
  fromTimestamp: number;
  toTimestamp: number;
  organizationId: Id<"organizations">;
};

export function useTotalRevenueByOrganization(
  params: TotalRevenueByOrganizationParams,
  enabled: boolean
): GetTotalRevenueByOrganizationData | undefined {
  const { organizationId, fromTimestamp, toTimestamp } = params;
  return useQuery(
    api.connectedPayments.getTotalRevenueByOrganization,
    enabled
      ? {
          organizationId,
          fromTimestamp,
          toTimestamp,
        }
      : "skip"
  );
}
