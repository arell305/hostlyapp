"use client";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";
import CampaignsLoader from "./components/CampaignsQuery";
import { useState } from "react";
import { CampaignFilter } from "@/shared/types/types";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";

const CampaignsUserIdPage = () => {
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState<CampaignFilter>("upcoming");

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Campaign"
        actions={
          <Link href={`${pathname}/add`}>
            <AddButton onClick={() => NProgress.start()} label="Campaign" />
          </Link>
        }
      />
      <ToggleTabs
        options={[
          { label: "Upcoming", value: "upcoming" },
          { label: "Completed", value: "completed" },
          { label: "Archived", value: "archived" },
        ]}
        value={selectedTab}
        onChange={setSelectedTab}
      />
      <CampaignsLoader selectedTab={selectedTab} />
    </PageContainer>
  );
};

export default CampaignsUserIdPage;
