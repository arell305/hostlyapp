"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { FrontendErrorMessages } from "@/shared/types/enums";
import { AudienceType } from "@/shared/types/types";

interface InsertCampaignInput {
  name: string;
  userId: Id<"users">;
  eventId: Id<"events"> | null;
  scheduleTime: number | null;
  promptResponse?: string;
  smsBody: string;
  audienceType: AudienceType;
  enableAiReplies: boolean;
  includeFaqInAiReplies?: boolean;
  aiPrompt?: string | null;
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
      const payload: InsertCampaignInput = {
        name: data.name,
        userId: data.userId,
        eventId: data.eventId,
        scheduleTime: data.scheduleTime,
        promptResponse: data.promptResponse,
        smsBody: data.smsBody,
        audienceType: data.audienceType,
        enableAiReplies: data.enableAiReplies,
      };

      if (data.enableAiReplies) {
        payload.includeFaqInAiReplies = data.includeFaqInAiReplies;

        const trimmedPrompt = data.aiPrompt?.trim();
        payload.aiPrompt = trimmedPrompt === "" ? null : trimmedPrompt;
      }
      const response = await insertCampaignMutation(payload);

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
