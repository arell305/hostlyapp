"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
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

interface CreateCampaignFormContextType {
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
  isFormDirty: boolean;
}

const CreateCampaignFormContext = createContext<
  CreateCampaignFormContextType | undefined
>(undefined);

export const CAMPAIGN_FORM_STEPS: CampaignFormStep[] = [
  "event",
  "template",
  "details",
];

interface CampaignFormProviderProps {
  children: ReactNode;
  initialEventId?: Id<"events"> | null;
}

export const CreateCampaignFormProvider = ({
  children,
  initialEventId,
}: CampaignFormProviderProps) => {
  const initialFormData = useRef<CampaignFormData>({
    eventId: initialEventId ?? undefined,
    templateId: undefined,
    name: "",
    sendAt: null,
    body: null,
    subject: undefined,
    content: undefined,
    timezone: undefined,
  });

  const [formData, setFormData] = useState<CampaignFormData>(
    initialFormData.current
  );
  const [currentStep, setCurrentStep] = useState<CampaignFormStep>(
    initialEventId ? "template" : "event"
  );
  const [sendType, setSendType] = useState<"now" | "later">("now");
  const [templateMode, setTemplateMode] = useState<TemplateMode>("list");
  const [template, setTemplate] = useState<Doc<"smsTemplates"> | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

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
    const idx = CAMPAIGN_FORM_STEPS.indexOf(currentStep);
    if (idx < CAMPAIGN_FORM_STEPS.length - 1) {
      setCurrentStep(CAMPAIGN_FORM_STEPS[idx + 1]);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const idx = CAMPAIGN_FORM_STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(CAMPAIGN_FORM_STEPS[idx - 1]);
    }
  }, [currentStep]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData.current);
    setCurrentStep(initialEventId ? "template" : "event");
    setSendType("now");
    setTemplate(null);
    setIsFormDirty(false);
  }, [initialEventId]);

  useEffect(() => {
    const dirty =
      formData.eventId !== initialFormData.current.eventId ||
      formData.templateId !== initialFormData.current.templateId ||
      formData.name !== initialFormData.current.name ||
      formData.body !== initialFormData.current.body ||
      formData.subject !== initialFormData.current.subject ||
      formData.content !== initialFormData.current.content ||
      formData.sendAt !== initialFormData.current.sendAt ||
      formData.timezone !== initialFormData.current.timezone ||
      sendType !== "now" ||
      template !== null;

    setIsFormDirty(dirty);
  }, [formData, sendType, template]);

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
    isFormDirty,
  };

  return (
    <CreateCampaignFormContext.Provider value={value}>
      {children}
    </CreateCampaignFormContext.Provider>
  );
};

export const useCreateCampaignForm = (): CreateCampaignFormContextType => {
  const context = useContext(CreateCampaignFormContext);
  if (!context) {
    throw new Error(
      "useCreateCampaignForm must be used within CreateCampaignFormProvider"
    );
  }
  return context;
};
