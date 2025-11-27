import { createContext, useState, useEffect, useMemo } from "react";
import { useCampaignScope } from "@/shared/hooks/contexts";
import { TemplateMode } from "@/shared/types/types";
import {
  hasEventRequiredVariables,
  hasGuestListVariables,
} from "@/shared/utils/uiHelpers";
import { DateTime } from "luxon"; // ← Make sure Luxon is imported
import { getDefaultScheduledTime } from "@/shared/utils/luxon";

type CampaignFormData = {
  name: string;
  smsBody: string;
  scheduleTime: number | null;
  promptResponse?: string;
  enableAiReplies?: boolean;
  includeFaqInAiReplies?: boolean;
  aiPrompt?: string | null;
};

export type CampaignFormContextType = {
  formData: CampaignFormData;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
  resetForm: () => void;
  hasChanges: boolean;
  sendType: "now" | "later";
  handleSendTypeChange: (type: "now" | "later") => void;
  bodyError: string | null;
};

export const CampaignFormContext =
  createContext<CampaignFormContextType | null>(null);

export const CampaignFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { campaign, isEditing } = useCampaignScope();

  const [sendType, setSendType] = useState<"now" | "later">("now");

  const handleSendTypeChange = (type: "now" | "later") => {
    setSendType(type);

    if (type === "later") {
      if (!formData.scheduleTime) {
        updateFormData({ scheduleTime: getDefaultScheduledTime() });
      }
    } else if (type === "now") {
      updateFormData({ scheduleTime: null });
    }
  };

  const [formData, setFormData] = useState<CampaignFormData>({
    name: campaign.name,
    smsBody: campaign.smsBody,
    scheduleTime: campaign.scheduleTime,
    promptResponse: campaign.promptResponse,
    enableAiReplies: campaign.enableAiReplies,
    includeFaqInAiReplies: campaign.includeFaqInAiReplies,
    aiPrompt: campaign.aiPrompt,
  });

  const bodyError = useMemo(() => {
    if (
      !campaign.eventId &&
      hasEventRequiredVariables(formData.smsBody ?? "")
    ) {
      return "Body contains tags that require an Event";
    }
    if (
      !campaign.hasGuestList &&
      hasGuestListVariables(formData.smsBody ?? "")
    ) {
      return "Body contains tags that require a Guest List";
    }
    return null;
  }, [formData.smsBody, campaign.eventId, campaign.hasGuestList]);

  useEffect(() => {
    if (isEditing) {
      const initialSendType = campaign.scheduleTime ? "later" : "now";
      setSendType(initialSendType);

      setFormData({
        name: campaign.name,
        smsBody: campaign.smsBody,
        scheduleTime: campaign.scheduleTime,
        promptResponse: campaign.promptResponse,
        enableAiReplies: campaign.enableAiReplies,
        includeFaqInAiReplies: campaign.includeFaqInAiReplies,
        aiPrompt: campaign.aiPrompt,
      });
    }
  }, [isEditing, campaign._id]);

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      name: campaign.name,
      smsBody: campaign.smsBody,
      scheduleTime: campaign.scheduleTime,
    });
    setSendType(campaign.scheduleTime ? "later" : "now");
  };

  const hasChanges =
    JSON.stringify({
      name: formData.name,
      smsBody: formData.smsBody,
      scheduleTime: formData.scheduleTime,
      enableAiReplies: formData.enableAiReplies,
      includeFaqInAiReplies: formData.includeFaqInAiReplies,
      aiPrompt: formData.aiPrompt,
    }) !==
    JSON.stringify({
      name: campaign.name,
      smsBody: campaign.smsBody,
      scheduleTime: campaign.scheduleTime,
      enableAiReplies: campaign.enableAiReplies,
      includeFaqInAiReplies: campaign.includeFaqInAiReplies,
      aiPrompt: campaign.aiPrompt,
    });

  return (
    <CampaignFormContext.Provider
      value={{
        formData,
        updateFormData,
        resetForm,
        hasChanges,
        sendType,
        handleSendTypeChange,
        bodyError,
      }}
    >
      {children}
    </CampaignFormContext.Provider>
  );
};
