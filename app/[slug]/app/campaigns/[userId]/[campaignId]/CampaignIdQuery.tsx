import SubscriptionSkeleton from "@/components/shared/skeleton/SubscriptionSkeleton";
import { useCampaignById } from "@/hooks/convex/campaigns/useCampaignById";
import { Id } from "convex/_generated/dataModel";
import React from "react";
import CampaignIdContent from "./CampaignIdContent";
import { useCampaignIdScope } from "@/contexts/CampaignIdScope";

const CampaignIdQuery = () => {
  const { campaignId } = useCampaignIdScope();
  const campaign = useCampaignById(campaignId);
  if (!campaign) {
    return <SubscriptionSkeleton />;
  }
  return <CampaignIdContent campaign={campaign} />;
};

export default CampaignIdQuery;
