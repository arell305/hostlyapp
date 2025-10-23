"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { FrontendErrorMessages } from "@/shared/types/enums";

interface InsertCampaignInput {
  name: string;
  isActive: boolean;
  userId: Id<"users">;
  eventId?: Id<"events">;
  scheduleTime?: number;
  relativeOffsetMinutes?: number;
  promptResponse?: string;
}

interface InsertCampaignResult {
  success: boolean;
  campaignId?: Id<"campaigns">;
}

export const useInsertCampaign = () => {
  const [insertCampaignLoading, setLoading] = useState<boolean>(false);
  const [insertCampaignError, setError] = useState<string | null>(null);

  const insertCampaignMutation = useMutation(api.campaigns.insertCampaign);

  const insertCampaign = async (
    data: InsertCampaignInput
  ): Promise<InsertCampaignResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await insertCampaignMutation(data);

      return { success: true, campaignId: response };
    } catch (error) {
      console.error(FrontendErrorMessages.GENERIC_ERROR, error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    insertCampaign,
    insertCampaignLoading,
    insertCampaignError,
    setInsertCampaignError: setError,
  };
};
