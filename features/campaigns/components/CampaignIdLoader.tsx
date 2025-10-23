"use client";

import SubscriptionSkeleton from "@shared/ui/skeleton/SubscriptionSkeleton";
import { useCampaignById } from "@/domain/campaigns";
import CampaignIdContent from "./CampaignIdContent";
import { useCampaignIdScope } from "@/contexts/CampaignIdScope";

const CampaignIdLoader = () => {
  const { campaignId } = useCampaignIdScope();
  const campaign = useCampaignById(campaignId);
  if (!campaign) {
    return <SubscriptionSkeleton />;
  }
  return <CampaignIdContent campaign={campaign} />;
};

export default CampaignIdLoader;
