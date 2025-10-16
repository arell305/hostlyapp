"use client";

import { useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { GetGuestListKpisData } from "@/types/convex-types";

export function useGuestListKpis(
  organizationId: Id<"organizations">,
  fromTimestamp: number,
  toTimestamp: number
): GetGuestListKpisData | undefined {
  return useQuery(api.guestListEntries.getGuestListKpis, {
    organizationId,
    fromTimestamp,
    toTimestamp,
  });
}
