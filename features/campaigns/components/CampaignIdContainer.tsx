"use client";

import { Doc } from "@/convex/_generated/dataModel";
import PageContainer from "@/shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@/shared/ui/headings/SectionHeaderWithAction";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import { useState } from "react";
import { CampaignTab } from "@/shared/types/types";

interface CampaignIdContainerProps {
  campaign: Doc<"campaigns">;
}

const CampaignIdContainer = ({ campaign }: CampaignIdContainerProps) => {
  const [selectedTab, setSelectedTab] = useState<CampaignTab>("messages");

  return (
    <PageContainer>
      <SectionHeaderWithAction title={`Campaign: ${campaign.name}`} />
      <ToggleTabs
        options={[
          { label: "Messages", value: "messages" },
          { label: "Details", value: "details" },
        ]}
        value={selectedTab}
        onChange={setSelectedTab}
      />
    </PageContainer>
  );
};

export default CampaignIdContainer;
