"use client";

import {
  CAMPAIGN_FORM_STEPS,
  useCreateCampaignForm,
} from "../contexts/CampaignFormContext";
import Stepper from "@shared/ui/stepper/Stepper";

const LABELS: Record<string, string> = {
  event: "Event",
  audience: "Audience",
  template: "Template",
  details: "Details",
};

type LocalCampaignFormStep = (typeof CAMPAIGN_FORM_STEPS)[number];

const CampaignStepper: React.FC = () => {
  const { currentStep, goToStep, formData, bodyError, enableTemplate } =
    useCreateCampaignForm();
  const steps = CAMPAIGN_FORM_STEPS.map((key) => ({ label: LABELS[key] }));
  const currentIndex = CAMPAIGN_FORM_STEPS.indexOf(
    currentStep as LocalCampaignFormStep
  );
  const numericCurrent = currentIndex + 1;

  const isBodyValid =
    formData.body && bodyError === null && formData.body.trim() !== "";

  const disabledSteps: number[] = [];
  if (formData.eventId === undefined) {
    disabledSteps.push(2, 3, 4);
  }
  if (!enableTemplate) {
    disabledSteps.push(3, 4);
  } else if (!isBodyValid) {
    disabledSteps.push(4);
  }

  const handleStepClick = (stepNumber: number) => {
    if (disabledSteps.includes(stepNumber)) {
      return;
    }
    const targetIndex = stepNumber - 1;
    const targetKey = CAMPAIGN_FORM_STEPS[targetIndex];
    if (!targetKey) {
      return;
    }
    goToStep(targetKey);
  };

  return (
    <Stepper
      steps={steps}
      currentStep={numericCurrent}
      onStepClick={handleStepClick}
      className="w-full"
      disabledSteps={disabledSteps}
    />
  );
};

export default CampaignStepper;
