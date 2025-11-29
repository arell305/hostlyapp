"use client";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";
import CampaignsLoader from "./components/CampaignsLoader";
import { useState } from "react";
import { CampaignFilterStatus } from "@/shared/types/types";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import ResponsiveCampaignFiltersActions from "./components/buttons/ResponsiveCampaignFiltersActions";

const CampaignsUserIdPage = () => {
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState<CampaignFilterStatus>("Sent");

  const handleTabChange = (tab: CampaignFilterStatus) => {
    setSelectedTab(tab);
  };
  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Campaigns"
        actions={
          <Link href={`${pathname}/add`}>
            <AddButton onClick={() => NProgress.start()} label="Campaign" />
          </Link>
        }
      />
      <div className="flex items-center gap-4">
        <ToggleTabs
          options={[
            { label: "Sent", value: "Sent" },
            { label: "Scheduled", value: "Scheduled" },
          ]}
          value={selectedTab}
          onChange={handleTabChange}
        />
        <ResponsiveCampaignFiltersActions
          onAction={handleTabChange}
          campaignStatus={selectedTab}
        />
      </div>
      <CampaignsLoader selectedTab={selectedTab} />
    </PageContainer>
  );
};

export default CampaignsUserIdPage;
