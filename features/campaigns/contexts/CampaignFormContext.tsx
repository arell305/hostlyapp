"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Id } from "@/convex/_generated/dataModel";

type CampaignFormStep = "event" | "template" | "details";

interface CampaignFormData {
  eventId?: Id<"events"> | null;
  templateId?: Id<"smsTemplates"> | null;
  body?: string;
  subject?: string;
  content?: string;
  sendAt: number | null;
  timezone?: string;
  name: string;
}

interface CampaignFormContextType {
  formData: CampaignFormData;
  currentStep: CampaignFormStep;
  updateFormData: (data: Partial<CampaignFormData>) => void;
  goToStep: (step: CampaignFormStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  isSubmitDisabled: boolean;
  sendType: "now" | "later";
  handleSendTypeChange: (type: "now" | "later") => void;
}

const CampaignFormContext = createContext<CampaignFormContextType | undefined>(
  undefined
);

export const CAMPAIGN_FORM_STEPS: CampaignFormStep[] = [
  "event",
  "template",
  "details",
];

export const CampaignFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    eventId: null,
    templateId: null,
    name: "",
    sendAt: null,
  });
  const [currentStep, setCurrentStep] = useState<CampaignFormStep>("event");
  const [sendType, setSendType] = useState<"now" | "later">("now");

  const handleSendTypeChange = (type: "now" | "later") => {
    setSendType(type);
  };

  const updateFormData = (data: Partial<CampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const goToStep = (step: CampaignFormStep) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const currentIndex = CAMPAIGN_FORM_STEPS.indexOf(currentStep);
    if (currentIndex < CAMPAIGN_FORM_STEPS.length - 1) {
      setCurrentStep(CAMPAIGN_FORM_STEPS[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = CAMPAIGN_FORM_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(CAMPAIGN_FORM_STEPS[currentIndex - 1]);
    }
  };

  const isSubmitDisabled =
    !formData.name.trim() ||
    !formData.body?.trim() ||
    formData.eventId === undefined ||
    (sendType === "later" &&
      (formData.sendAt === null || formData.sendAt <= Date.now()));

  return (
    <CampaignFormContext.Provider
      value={{
        formData,
        currentStep,
        updateFormData,
        goToStep,
        nextStep,
        prevStep,
        isSubmitDisabled,
        sendType,
        handleSendTypeChange,
      }}
    >
      {children}
    </CampaignFormContext.Provider>
  );
};

export const useCampaignForm = () => {
  const context = useContext(CampaignFormContext);
  if (!context) {
    throw new Error("useCampaignForm must be used within CampaignFormProvider");
  }
  return context;
};
