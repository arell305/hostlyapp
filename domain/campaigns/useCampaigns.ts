import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCampaigns(
  userId: Id<"users">
): Doc<"campaigns">[] | undefined {
  return useQuery(api.campaigns.getCampaigns, { userId });
}
