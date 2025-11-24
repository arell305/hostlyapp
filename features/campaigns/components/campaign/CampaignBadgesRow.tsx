import { Badge } from "@shared/ui/primitive/badge";
import { Doc } from "convex/_generated/dataModel";
import { formatDateTime } from "@/shared/utils/luxon";

interface CampaignBadgesRowProps {
  campaign: Doc<"campaigns">;
}

const CampaignBadgesRow = ({ campaign }: CampaignBadgesRowProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {campaign.status === "Cancelled" && (
        <Badge
          variant="secondary"
          className="bg-transparent text-red-300 border border-red-800 hover:bg-transparent"
        >
          {campaign.status}
        </Badge>
      )}
      {campaign.status === "Scheduled" && campaign.scheduleTime && (
        <Badge
          variant="secondary"
          className="bg-blue-900/60 text-blue-300 border border-blue-800 hover:bg-blue-900/60"
        >
          Scheduled for {formatDateTime(campaign.scheduleTime)}
        </Badge>
      )}
      {campaign.status === "Sent" && campaign.sentAt && (
        <Badge
          variant="secondary"
          className="bg-emerald-900/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60"
        >
          Sent at {formatDateTime(campaign.sentAt)}
        </Badge>
      )}
      {campaign.status === "Failed" && campaign.sentAt && (
        <Badge
          variant="destructive"
          className="bg-red-900/70 text-red-300 border border-red-800 hover:bg-red-900/70"
        >
          Failed at {formatDateTime(campaign.sentAt)}
        </Badge>
      )}
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
