"use client";

import { formatShortDateTime } from "@/shared/utils/luxon";
import { CampaignWithEvent } from "@/shared/types/types";
import { Doc } from "@/convex/_generated/dataModel";

interface CampaignDescriptionProps {
  campaign: CampaignWithEvent | Doc<"campaigns">;
}

/**
 * Stacked description lines: event, audience, schedule/sent/failed.
 * Keeps min height so cards align when a value is missing.
 */
const CampaignDescription = ({ campaign }: CampaignDescriptionProps) => {
  const lines: string[] = [];

  // Event
  if ("eventName" in campaign && campaign.eventName) {
    lines.push(campaign.eventName);
  }

  // Audience
  if (campaign.audienceType) {
    lines.push(campaign.audienceType);
  }

  // Status dates
  if (campaign.status === "Scheduled" && campaign.scheduleTime) {
    lines.push(`Scheduled: ${formatShortDateTime(campaign.scheduleTime)}`);
  } else if (campaign.status === "Sent" && campaign.sentAt) {
    lines.push(`Sent: ${formatShortDateTime(campaign.sentAt)}`);
  } else if (campaign.status === "Failed" && campaign.sentAt) {
    lines.push(`Failed: ${formatShortDateTime(campaign.sentAt)}`);
  }

  const hasLines = lines.length > 0;

  return (
    <div className="flex flex-col text-sm text-muted-foreground min-h-[48px]">
      {hasLines ? (
        lines.map((line, i) => (
          <span key={i} className="truncate" title={line}>
            {line}
          </span>
        ))
      ) : (
        // invisible placeholder keeps vertical rhythm / height
        <span className="opacity-0 select-none">placeholder</span>
      )}
    </div>
  );
};

export default CampaignDescription;
