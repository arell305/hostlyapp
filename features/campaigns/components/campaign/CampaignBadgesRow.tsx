"use client";

import { Badge } from "@shared/ui/primitive/badge";
import { CampaignWithEvent } from "@/shared/types/types";
import { Doc } from "@/convex/_generated/dataModel";

interface CampaignBadgesProps {
  campaign: CampaignWithEvent | Doc<"campaigns">;
}

const CampaignBadges = ({ campaign }: CampaignBadgesProps) => {
  const aiStatus = campaign.stopRepliesAt
    ? "AI Stopped"
    : campaign.enableAiReplies
      ? "AI Enabled"
      : "AI Disabled";

  const aiClass = campaign.stopRepliesAt
    ? "bg-yellow-900/40 text-yellow-200 border border-yellow-800 hover:bg-yellow-900/40" // changed from red
    : campaign.enableAiReplies
      ? "bg-purple-900/60 text-purple-300 border border-purple-800 hover:bg-purple-900/60"
      : "bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-800/80";

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {"awaitingReplies" in campaign && campaign.awaitingReplies > 0 && (
        <Badge
          variant="secondary"
          className="bg-red-900/80 text-red-300 border border-red-800 font-medium text-xs px-2.5 py-0.5 hover:bg-red-900/80"
        >
          Replies Needed ({campaign.awaitingReplies})
        </Badge>
      )}

      <Badge
        variant="secondary"
        className={`font-medium text-xs px-2.5 py-0.5 ${aiClass}`}
      >
        {aiStatus}
      </Badge>

      {!campaign.isActive && (
        <Badge
          variant="secondary"
          className="bg-gray-800/80 text-gray-300 border border-gray-700 font-medium text-xs px-2.5 py-0.5 hover:bg-gray-800/80"
        >
          Archived
        </Badge>
      )}
    </div>
  );
};

export default CampaignBadges;
