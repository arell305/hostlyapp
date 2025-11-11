"use client";

import { useCampaignScope } from "@/shared/hooks/contexts";
import CustomCard from "@/shared/ui/cards/CustomCard";
import StaticField from "@/shared/ui/fields/StaticField";

const MessagingHeader = () => {
  const { campaign } = useCampaignScope();

  return (
    <div>
      <h2 className="mb-1 font-medium">Campaign </h2>
      <CustomCard>
        <StaticField label="Status" value={campaign.name} />
      </CustomCard>
    </div>
  );
};

export default MessagingHeader;
