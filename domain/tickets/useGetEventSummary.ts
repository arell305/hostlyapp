"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GetEventSummaryData } from "@/shared/types/convex-types";
import { Id } from "@/convex/_generated/dataModel";

type GetEventSummaryParams = {
  eventId: Id<"events">;
};

export function useGetEventSummary(
  params: GetEventSummaryParams
): GetEventSummaryData | undefined {
  const { eventId } = params;

  return useQuery(api.tickets.getEventSummary, { eventId });
}
