"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { TemplateMode } from "@/shared/types/types";

type CampaignFormStep = "event" | "template" | "details";

interface CampaignFormData {
  eventId?: Id<"events"> | null;
  templateId?: Id<"smsTemplates"> | null;
  body: string | null;
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
  templateMode: TemplateMode;
  setTemplateMode: (mode: TemplateMode) => void;
  template: Doc<"smsTemplates"> | null;
  setTemplate: (template: Doc<"smsTemplates"> | null) => void;
  resetForm: () => void;
}

const CampaignFormContext = createContext<CampaignFormContextType | undefined>(
  undefined
);

export const CAMPAIGN_FORM_STEPS: CampaignFormStep[] = [
  "event",
  "template",
  "details",
];

interface CampaignFormProviderProps {
  children: ReactNode;
  initialEventId?: Id<"events"> | null; // ← from URL query param
}

export const CampaignFormProvider = ({
  children,
  initialEventId,
}: CampaignFormProviderProps) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    eventId: initialEventId ? (initialEventId as Id<"events">) : undefined,
    templateId: undefined,
    name: "",
    sendAt: null,
    body: null,
    subject: undefined,
    content: undefined,
    timezone: undefined,
  });

  const [currentStep, setCurrentStep] = useState<CampaignFormStep>(() => {
    return initialEventId ? "template" : "event";
  });
  const [sendType, setSendType] = useState<"now" | "later">("now");
  const [templateMode, setTemplateMode] = useState<TemplateMode>("list");
  const [template, setTemplate] = useState<Doc<"smsTemplates"> | null>(null);

  const handleSendTypeChange = (type: "now" | "later") => {
    setSendType(type);
  };

  const updateFormData = useCallback((data: Partial<CampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const goToStep = useCallback((step: CampaignFormStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = CAMPAIGN_FORM_STEPS.indexOf(currentStep);
    if (currentIndex < CAMPAIGN_FORM_STEPS.length - 1) {
      setCurrentStep(CAMPAIGN_FORM_STEPS[currentIndex + 1]);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const currentIndex = CAMPAIGN_FORM_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(CAMPAIGN_FORM_STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  const resetForm = useCallback(() => {
    setFormData({
      eventId: initialEventId ? (initialEventId as Id<"events">) : undefined,
      templateId: undefined,
      name: "",
      sendAt: null,
      body: null,
      subject: undefined,
      content: undefined,
      timezone: undefined,
    });
    setCurrentStep("event");
    setSendType("now");
    setTemplate(null);
  }, [initialEventId]);

  const isSubmitDisabled =
    !formData.name.trim() ||
    !formData.body?.trim() ||
    formData.eventId === undefined ||
    (sendType === "later" &&
      (formData.sendAt === null || formData.sendAt <= Date.now()));

  const value = {
    formData,
    currentStep,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    isSubmitDisabled,
    sendType,
    handleSendTypeChange,
    templateMode,
    setTemplateMode,
    template,
    setTemplate,
    resetForm,
  };

  return (
    <CampaignFormContext.Provider value={value}>
      {children}
    </CampaignFormContext.Provider>
  );
};

export const useCampaignForm = (): CampaignFormContextType => {
  const context = useContext(CampaignFormContext);
  if (!context) {
    throw new Error("useCampaignForm must be used within CampaignFormProvider");
  }
  return context;
};
