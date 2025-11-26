"use client";

import { useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { SmsThreadWithContactAndLastMessage } from "@/shared/types/convex-types";

export function useSmsThreads(
  campaignId: Id<"campaigns">
): SmsThreadWithContactAndLastMessage[] | undefined {
  return useQuery(api.smsThreads.getSmsThreadsForCampaign, { campaignId });
}
