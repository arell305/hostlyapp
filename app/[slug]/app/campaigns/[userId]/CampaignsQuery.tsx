"use client";
import SubscriptionSkeleton from "@/components/shared/skeleton/SubscriptionSkeleton";
import React from "react";
import { useCampaigns } from "@/hooks/convex/campaigns";
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
