"use client";

import { Badge } from "@shared/ui/primitive/badge";
import { formatShortDateTime } from "@/shared/utils/luxon";
import { CampaignWithEvent } from "@/shared/types/types";
import { Doc } from "@/convex/_generated/dataModel";

interface CampaignBadgesRowProps {
  campaign: CampaignWithEvent | Doc<"campaigns">;
}

const CampaignBadgesRow = ({ campaign }: CampaignBadgesRowProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {"eventName" in campaign && campaign.eventName && (
        <Badge
          variant="secondary"
          className="bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-800/80 font-medium text-xs px-2.5 py-0.5 truncate max-w-[250px]"
          title={campaign.eventName}
        >
          {campaign.eventName}
        </Badge>
      )}
      {/* PRIMARY STATUS BADGES */}
      {campaign.status === "Cancelled" && (
        <Badge
          variant="secondary"
          className="bg-transparent text-red-300 border border-red-800 hover:bg-transparent font-medium text-xs px-2.5 py-0.5"
        >
          {campaign.status}
        </Badge>
      )}

      {campaign.status === "Scheduled" && campaign.scheduleTime && (
        <Badge
          variant="secondary"
          className="bg-blue-900/60 text-blue-300 border border-blue-800 hover:bg-blue-900/60 font-medium text-xs px-2.5 py-0.5"
        >
          Scheduled: {formatShortDateTime(campaign.scheduleTime)}
        </Badge>
      )}

      {campaign.status === "Sent" && campaign.sentAt && (
        <Badge
          variant="secondary"
          className="bg-emerald-900/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60 font-medium text-xs px-2.5 py-0.5"
        >
          Sent: {formatShortDateTime(campaign.sentAt)}
        </Badge>
      )}

      {campaign.status === "Failed" && campaign.sentAt && (
        <Badge
          variant="destructive"
          className="bg-red-900/70 text-red-300 border border-red-800 hover:bg-red-900/70 font-medium text-xs px-2.5 py-0.5"
        >
          Failed: {formatShortDateTime(campaign.sentAt)}
        </Badge>
      )}

      {/* AUDIENCE TYPE */}
      {campaign.audienceType && (
        <Badge
          variant="secondary"
          className="bg-indigo-900/60 text-indigo-300 border border-indigo-800 hover:bg-indigo-900/60 font-medium text-xs px-2.5 py-0.5"
        >
          {campaign.audienceType}
        </Badge>
      )}

      {/* AI STATUS */}
      {campaign.stopRepliesAt ? (
        <Badge
          variant="destructive"
          className="bg-red-900/70 text-red-300 border border-red-800 hover:bg-red-900/70 font-medium text-xs px-2.5 py-0.5"
        >
          AI Stopped
        </Badge>
      ) : campaign.enableAiReplies ? (
        <Badge
          variant="secondary"
          className="bg-purple-900/60 text-purple-300 border border-purple-800 hover:bg-purple-900/60 font-medium text-xs px-2.5 py-0.5"
        >
          AI Enabled
        </Badge>
      ) : (
        <Badge
          variant="secondary"
          className="bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-800/80 font-medium text-xs px-2.5 py-0.5"
        >
          AI Disabled
        </Badge>
      )}

      {/* ARCHIVED */}
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

export default CampaignBadgesRow;
