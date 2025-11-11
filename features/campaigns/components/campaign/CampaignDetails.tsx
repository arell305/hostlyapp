"use client";

import { updateCampaign } from "@/convex/campaigns";
import { useUpdateCampaign } from "@/domain/campaigns";
import { useCampaignScope } from "@/shared/hooks/contexts";
import { CampaignValues } from "@/shared/types/types";
import CustomCard from "@/shared/ui/cards/CustomCard";
import StaticField from "@/shared/ui/fields/StaticField";
import { formatDateMDY } from "@/shared/utils/luxon";
import { Calendar, Clock, MessageCircle } from "lucide-react";

const CampaignDetails = () => {
  const { campaign } = useCampaignScope();

  const { updateCampaign, updateCampaignLoading, updateCampaignError } =
    useUpdateCampaign();

  const handleSave = async (update: CampaignValues): Promise<boolean> => {
    const result = await updateCampaign({
      campaignId: campaign._id,
      updates: { ...update },
    });
    return result.success;
  };

  return (
    <div>
      <h2 className="mb-1 font-medium">Campaign Details</h2>
      <CustomCard>
        <StaticField
          label="Name"
          value={campaign.name}
          icon={<Calendar className="text-xl" />}
        />
        <StaticField
          label="Send Time"
          value={formatDateMDY(campaign.scheduleTime ?? 0)}
          icon={<Clock className="text-xl" />}
        />
        <StaticField
          label="Body"
          value={campaign.smsBody}
          icon={<MessageCircle className="text-xl" />}
        />
      </CustomCard>
    </div>
  );
};

export default CampaignDetails;
