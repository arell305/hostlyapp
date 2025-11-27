"use client";

import { Badge } from "@shared/ui/primitive/badge";
import { Doc } from "@convex/_generated/dataModel";
import {
  hasEventRequiredVariables,
  hasGuestListVariables,
} from "@/shared/utils/uiHelpers";

interface TemplateBadgesRowProps {
  template: Doc<"smsTemplates">;
}

const TemplateBadgesRow = ({ template }: TemplateBadgesRowProps) => {
  const eventRequired = hasEventRequiredVariables(template.body);
  const guestListApplicable = hasGuestListVariables(template.body);

  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {eventRequired && (
        <Badge
          variant="secondary"
          className="bg-emerald-900/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60 font-medium text-xs px-2.5 py-0.5"
        >
          Event Required
        </Badge>
      )}
      {guestListApplicable && (
        <Badge
          variant="secondary"
          className="bg-indigo-900/60 text-indigo-300 border border-indigo-800 hover:bg-indigo-900/60 font-medium text-xs px-2.5 py-0.5"
        >
          Guest List Required
        </Badge>
      )}
    </div>
  );
};

export default TemplateBadgesRow;
