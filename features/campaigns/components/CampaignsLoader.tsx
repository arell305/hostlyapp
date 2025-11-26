"use client";
import { useCampaigns } from "@/domain/campaigns";
import { useUserScope } from "@/shared/hooks/contexts";
import CampaignsSection from "../CampaignsSection";
import { CampaignFilterStatus } from "@/shared/types/types";
import CampaignCardsSkeleton from "@/shared/ui/skeleton/CampaignCardsSkeleton";

interface CampaignsLoaderProps {
  selectedTab: CampaignFilterStatus;
}

const CampaignsLoader = ({ selectedTab }: CampaignsLoaderProps) => {
  const { userId } = useUserScope();

  const isActive = selectedTab !== "Archived";

  const status = selectedTab !== "Archived" ? selectedTab : undefined;
  const campaigns = useCampaigns(userId, status, isActive);

  if (!campaigns) {
    return <CampaignCardsSkeleton />;
  }

  return <CampaignsSection campaigns={campaigns} />;
};

export default CampaignsLoader;
