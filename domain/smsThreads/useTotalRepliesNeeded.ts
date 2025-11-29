"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function useTotalRepliesNeeded(): number | undefined {
  return useQuery(api.smsThreads.getTotalRepliesNeeded);
}
