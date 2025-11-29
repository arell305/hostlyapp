"use client";

import { useCampaignScope } from "@/shared/hooks/contexts";
import CustomCard from "@/shared/ui/cards/CustomCard";
import StaticField from "@/shared/ui/fields/StaticField";
import { formatDisplayDateTime } from "@/shared/utils/luxon";
import { Book, CheckCircle, Sparkles, StopCircle } from "lucide-react";
import { getAiStatusBadge, getAiStatusText } from "../../utils/reactHelpers";

const AiDetails = () => {
  const { campaign } = useCampaignScope();

  const statusBadges = getAiStatusBadge(
    campaign.enableAiReplies,
    campaign.stopRepliesAt
  );

  const statusText = getAiStatusText(
    campaign.enableAiReplies,
    campaign.stopRepliesAt
  );

  return (
    <div>
      <h2 className="mb-1 font-medium">AI Replies Details</h2>

      <CustomCard>
        <StaticField
          label="Status"
          value={statusText}
          icon={<CheckCircle className="text-xl" />}
          badge={statusBadges}
        />
        {campaign.enableAiReplies && (
          <>
            <StaticField
              label="Prompt"
              value={campaign.aiPrompt}
              icon={<Sparkles className="text-xl" />}
            />
            <StaticField
              label="FAQ"
              value={campaign.includeFaqInAiReplies ? "Enabled" : "Disabled"}
              icon={<Book className="text-xl" />}
            />
          </>
        )}
      </CustomCard>
    </div>
  );
};

export default AiDetails;
