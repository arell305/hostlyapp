"use client";

import { useQuery } from "convex/react";
import type { Doc, Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";

export function useSmsThreads(
  campaignId: Id<"campaigns">
): Doc<"smsThreads">[] | undefined {
  return useQuery(api.smsThreads.getSmsThreadsForCampaign, { campaignId });
}
