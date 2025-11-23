import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCampaignsByEventId(
  eventId: Id<"events">
): Doc<"campaigns">[] | undefined {
  return useQuery(api.campaigns.getCampaignsByEventId, { eventId });
}
