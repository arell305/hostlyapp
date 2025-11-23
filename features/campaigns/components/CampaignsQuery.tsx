"use client";
import { useCampaigns } from "@/domain/campaigns";
import { useUserScope } from "@/shared/hooks/contexts";
import CampaignsSection from "../CampaignsSection";
import { CampaignFilterStatus } from "@/shared/types/types";

interface CampaignsLoaderProps {
  selectedTab: CampaignFilterStatus;
  searchTerm: string;
}

const CampaignsLoader = ({ selectedTab, searchTerm }: CampaignsLoaderProps) => {
  const { userId } = useUserScope();

  const isActive = selectedTab !== "Archived";

  const status = selectedTab !== "Archived" ? selectedTab : undefined;
  const campaigns = useCampaigns(userId, status, isActive);

  if (!campaigns) {
    return;
  }

  return <CampaignsSection campaigns={campaigns} searchTerm={searchTerm} />;
};

export default CampaignsLoader;
