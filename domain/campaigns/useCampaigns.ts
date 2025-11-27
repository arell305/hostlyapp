import { CampaignStatus, CampaignWithEvent } from "@/shared/types/types";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCampaigns(
  userId: Id<"users">,
  status?: CampaignStatus,
  isActive?: boolean
): CampaignWithEvent[] | undefined {
  return useQuery(api.campaigns.getCampaigns, { userId, status, isActive });
}
