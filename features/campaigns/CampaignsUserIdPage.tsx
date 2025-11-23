"use client";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";
import CampaignsLoader from "./components/CampaignsQuery";
import { useRef, useState } from "react";
import { CampaignFilterStatus } from "@/shared/types/types";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import ResponsiveCampaignFiltersActions from "./components/buttons/ResponsiveCampaignFiltersActions";
import SearchInput from "../events/components/SearchInput";

const CampaignsUserIdPage = () => {
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] =
    useState<CampaignFilterStatus>("Scheduled");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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
            { label: "Scheduled", value: "Scheduled" },
            { label: "Sent", value: "Sent" },
          ]}
          value={selectedTab}
          onChange={handleTabChange}
        />
        <ResponsiveCampaignFiltersActions
          onAction={handleTabChange}
          campaignStatus={selectedTab}
        />
      </div>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search campaigns..."
      />
      <CampaignsLoader selectedTab={selectedTab} searchTerm={searchTerm} />
    </PageContainer>
  );
};

export default CampaignsUserIdPage;
