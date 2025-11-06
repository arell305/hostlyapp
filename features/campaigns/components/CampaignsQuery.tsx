"use client";
import { useCampaigns } from "@/domain/campaigns";
import { useUserScope } from "@/shared/hooks/contexts";
import CampaignsSection from "../CampaignsSection";
import { CampaignFilter } from "@/shared/types/types";

interface CampaignsLoaderProps {
  selectedTab: CampaignFilter;
}

const CampaignsLoader = ({ selectedTab }: CampaignsLoaderProps) => {
  const { userId } = useUserScope();
  const campaigns = useCampaigns(userId, selectedTab);

  if (!campaigns) {
    return;
  }

  return <CampaignsSection campaigns={campaigns} />;
};

export default CampaignsLoader;
