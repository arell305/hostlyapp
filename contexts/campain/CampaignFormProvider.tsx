import { createContext, useState, useEffect } from "react";
import { useCampaignScope } from "@/shared/hooks/contexts";
import { TemplateMode } from "@/shared/types/types";

type CampaignFormData = {
  name: string;
  smsBody: string;
  scheduleTime: number | null;
};

export type CampaignFormContextType = {
  formData: CampaignFormData;
  updateFormData: (updates: Partial<CampaignFormData>) => void;
  resetForm: () => void;
  hasChanges: boolean;
  sendType: "now" | "later";
  handleSendTypeChange: (type: "now" | "later") => void;
  templateMode: TemplateMode;
  setTemplateMode: (mode: TemplateMode) => void;
};

export const CampaignFormContext =
  createContext<CampaignFormContextType | null>(null);

export const CampaignFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { campaign, isEditing } = useCampaignScope();

  const [sendType, setSendType] = useState<"now" | "later">("now");
  const [templateMode, setTemplateMode] = useState<TemplateMode>("list");

  const handleSendTypeChange = (type: "now" | "later") => {
    setSendType(type);
  };

  const [formData, setFormData] = useState<CampaignFormData>({
    name: campaign.name,
    smsBody: campaign.smsBody,
    scheduleTime: campaign.scheduleTime,
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: campaign.name,
        smsBody: campaign.smsBody,
        scheduleTime: campaign.scheduleTime,
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
  };

  const hasChanges =
    JSON.stringify(formData) !==
    JSON.stringify({
      name: campaign.name,
      smsBody: campaign.smsBody,
      scheduleTime: campaign.scheduleTime,
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
        templateMode,
        setTemplateMode,
      }}
    >
      {children}
    </CampaignFormContext.Provider>
  );
};
