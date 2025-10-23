"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { FrontendErrorMessages } from "@/shared/types/enums";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface UpdateCampaignInput {
  campaignId: Id<"campaigns">;
  updates: {
    name?: string;
    isActive?: boolean;
    eventId?: Id<"events">;
    scheduleTime?: number;
    relativeOffsetMinutes?: number;
    promptResponse?: string;
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
      console.error(FrontendErrorMessages.GENERIC_ERROR, err);
      setError(FrontendErrorMessages.GENERIC_ERROR);
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
