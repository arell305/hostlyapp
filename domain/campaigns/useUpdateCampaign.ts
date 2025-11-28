"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { AudienceType, CampaignStatus } from "@/shared/types/types";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

interface UpdateCampaignInput {
  campaignId: Id<"campaigns">;
  updates: {
    name?: string;
    isActive?: boolean;
    eventId?: Id<"events">;
    scheduleTime?: number | null;
    status?: CampaignStatus;
    audienceType?: AudienceType;
    stopRepliesAt?: number;
    enableAiReplies?: boolean;
    includeFaqInAiReplies?: boolean;
    aiPrompt?: string | null;
  };
}

interface UpdateCampaignResult {
  success: boolean;
  campaignId?: Id<"campaigns">;
}

export const useUpdateCampaign = () => {
  const [updateCampaignLoading, setLoading] = useState<boolean>(false);
  const [updateCampaignError, setError] = useState<string | null>(null);

  const updateCampaignMutation = useMutation(api.campaigns.updateCampaign);

  const updateCampaign = async (
    data: UpdateCampaignInput
  ): Promise<UpdateCampaignResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateCampaignMutation(data);

      return { success: true, campaignId: response };
    } catch (err) {
      setErrorFromConvexError(err, setError);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateCampaign,
    updateCampaignLoading,
    updateCampaignError,
    setUpdateCampaignError: setError,
  };
};
