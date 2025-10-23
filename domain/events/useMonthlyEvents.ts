"use client";

import { useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { EventWithExtras } from "@shared/types/convex-types";

export function useMonthlyEvents(
  organizationId: Id<"organizations">,
  year: number,
  month: number
): EventWithExtras[] | undefined {
  return useQuery(api.events.getEventsByMonth, {
    organizationId,
    year,
    month,
  });
}
