"use client";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from "nprogress";
import CampaignsLoader from "./components/CampaignsQuery";
import { useState } from "react";
import { CampaignStatus } from "@/shared/types/types";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";

const CampaignsUserIdPage = () => {
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState<CampaignStatus>("Scheduled");

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
          { label: "Scheduled", value: "Scheduled" },
          { label: "Sent", value: "Sent" },
          { label: "Failed", value: "Failed" },
          { label: "Cancelled", value: "Cancelled" },
        ]}
        value={selectedTab}
        onChange={setSelectedTab}
      />
      <CampaignsLoader selectedTab={selectedTab} />
    </PageContainer>
  );
};

export default CampaignsUserIdPage;
