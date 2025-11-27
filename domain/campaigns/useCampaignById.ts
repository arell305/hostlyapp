import { CampaignWithGuestList } from "@/shared/types/types";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCampaignById(
  campaignId: Id<"campaigns">
): CampaignWithGuestList | undefined {
  return useQuery(api.campaigns.getCampaignById, { campaignId });
}
