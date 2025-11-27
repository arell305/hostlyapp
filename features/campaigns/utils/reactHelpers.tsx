// src/shared/utils/campaignStatusBadge.ts
import { CampaignStatus } from "@/shared/types/types";
import { Badge } from "@/shared/ui/primitive/badge";
import { type ReactNode } from "react";

export const getCampaignStatusBadge = (
  status: CampaignStatus,
  isArchived: boolean
): ReactNode => {
  const baseClasses = "font-medium text-xs px-2.5 py-0.5";

  const statusConfig: Record<
    CampaignStatus,
    {
      variant: "default" | "secondary" | "destructive";
      className: string;
      // Explicitly disable hover by overriding
      hoverClass?: string;
    }
  > = {
    Scheduled: {
      variant: "secondary",
      className:
        "bg-blue-900/60 text-blue-300 border border-blue-800 hover:bg-blue-900/60", // no change
    },
    Sent: {
      variant: "secondary",
      className:
        "bg-emerald-900/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60",
    },
    Failed: {
      variant: "destructive",
      className:
        "bg-red-900/70 text-red-300 border border-red-800 hover:bg-red-900/70",
    },
    Cancelled: {
      variant: "secondary",
      className:
        "bg-transparent text-red-300 border border-red-800 hover:bg-transparent",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex gap-2">
      <Badge
        variant={config.variant}
        className={`${baseClasses} ${config.className}`}
      >
        {status}
      </Badge>

      {isArchived && (
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

export const getAiStatusBadge = (
  enableAiReplies: boolean,
  stopRepliesAt?: number | null
): ReactNode => {
  const baseClasses = "font-medium text-xs px-2.5 py-0.5";

  // Determine the state
  let state: "enabled" | "disabled" | "stopped" = enableAiReplies
    ? "enabled"
    : "disabled";

  if (stopRepliesAt !== undefined && stopRepliesAt !== null) {
    state = "stopped";
  }

  const stateConfig: Record<
    "enabled" | "disabled" | "stopped",
    {
      label: string;
      variant: "default" | "secondary" | "destructive";
      className: string;
    }
  > = {
    enabled: {
      label: "AI Enabled",
      variant: "secondary",
      className:
        "bg-purple-900/60 text-purple-300 border border-purple-800 hover:bg-purple-900/60",
    },
    disabled: {
      label: "AI Disabled",
      variant: "secondary",
      className:
        "bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-800/80",
    },
    stopped: {
      label: "Stopped",
      variant: "destructive",
      className:
        "bg-red-900/70 text-red-300 border border-red-800 hover:bg-red-900/70",
    },
  };

  const config = stateConfig[state];

  return (
    <Badge
      variant={config.variant}
      className={`${baseClasses} ${config.className}`}
    >
      {config.label}
    </Badge>
  );
};

export const getAiStatusText = (
  enableAiReplies: boolean,
  stopRepliesAt?: number | null
): string => {
  if (stopRepliesAt !== undefined && stopRepliesAt !== null) {
    return "Stopped";
  }

  return enableAiReplies ? "Enabled" : "Disabled";
};
