"use client";
import SubscriptionSkeleton from "@shared/ui/skeleton/SubscriptionSkeleton";
import { useCampaigns } from "@/domain/campaigns";
import CampaignsContent from "./CampaignsContent";
import { useUserScope } from "@/contexts/UserScope";

const CampaignsQuery = () => {
  const { userId } = useUserScope();
  const campaigns = useCampaigns(userId);

  if (!campaigns) {
    return <SubscriptionSkeleton />;
  }

  return <CampaignsContent campaigns={campaigns} />;
};

export default CampaignsQuery;
