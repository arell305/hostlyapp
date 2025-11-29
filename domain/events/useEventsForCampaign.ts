"use client";

import { useQuery } from "convex/react";
import type { Doc, Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { EventFilterWithoutNone } from "@/shared/types/types";
import { EventWithExtras } from "@/shared/types/convex-types";

export function useEventsForCampaign(
  organizationId: Id<"organizations">,
  eventFilter: EventFilterWithoutNone,
  searchTerm: string
): EventWithExtras[] | undefined {
  const shouldSkip = eventFilter === "past" && searchTerm.length < 3;

  return useQuery(
    api.events.getEventsForCampaign,
    shouldSkip
      ? "skip"
      : {
          organizationId,
          range: eventFilter,
          search: searchTerm,
        }
  );
}
