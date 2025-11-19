"use client";

import { useUpdateCampaign } from "@/domain/campaigns";
import { useCampaignScope } from "@/shared/hooks/contexts";
import { CampaignValues } from "@/shared/types/types";
import CustomCard from "@/shared/ui/cards/CustomCard";
import StaticField from "@/shared/ui/fields/StaticField";
import { formatDisplayDateTime } from "@/shared/utils/luxon";
import { Badge, Calendar, Clock, MessageCircle } from "lucide-react";

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
          label="Status"
          value={campaign.status}
          icon={<Badge className="text-xl" />}
        />
      </CustomCard>
      <CustomCard>
        <StaticField
          label="Name"
          value={campaign.name}
          icon={<Calendar className="text-xl" />}
        />
        <StaticField
          label="Scheduled for"
          value={formatDisplayDateTime(campaign.scheduleTime)}
          icon={<Clock className="text-xl" />}
        />
        {campaign.sentAt && (
          <StaticField
            label="Sent at"
            value={formatDisplayDateTime(campaign.sentAt)}
            icon={<Clock className="text-xl" />}
          />
        )}
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
