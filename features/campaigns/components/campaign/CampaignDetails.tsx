"use client";

import { useCampaignScope } from "@/shared/hooks/contexts";
import CustomCard from "@/shared/ui/cards/CustomCard";
import StaticField from "@/shared/ui/fields/StaticField";
import { formatDisplayDateTime } from "@/shared/utils/luxon";
import { Calendar, Clock, MessageCircle, Users } from "lucide-react";
import { getCampaignStatusBadge } from "../../utils/reactHelpers";

const CampaignDetails = () => {
  const { campaign } = useCampaignScope();
  const isArchived = !campaign.isActive;

  const statusBadges = getCampaignStatusBadge(campaign.status, isArchived);

  return (
    <div>
      <h2 className="mb-1 font-medium">Campaign Details</h2>

      <CustomCard>
        <StaticField
          label="Name"
          value={campaign.name}
          icon={<Calendar className="text-xl" />}
          badge={statusBadges}
        />
        <StaticField
          label="Audience"
          value={campaign.audienceType}
          icon={<Users className="text-xl" />}
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
