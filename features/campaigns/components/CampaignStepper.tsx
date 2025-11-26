"use client";

import {
  CAMPAIGN_FORM_STEPS,
  useCreateCampaignForm,
} from "../contexts/CampaignFormContext";
import Stepper from "@shared/ui/stepper/Stepper";

const LABELS: Record<string, string> = {
  event: "Event",
  template: "Template",
  details: "Details",
};

type LocalCampaignFormStep = (typeof CAMPAIGN_FORM_STEPS)[number];

const CampaignStepper: React.FC = () => {
  const { currentStep, goToStep, formData } = useCreateCampaignForm();
  const steps = CAMPAIGN_FORM_STEPS.map((key) => ({ label: LABELS[key] }));
  const currentIndex = CAMPAIGN_FORM_STEPS.indexOf(
    currentStep as LocalCampaignFormStep
  );
  const numericCurrent = currentIndex + 1;

  const disabledSteps: number[] = [];
  if (formData.eventId === undefined) {
    disabledSteps.push(2, 3);
  } else if (formData.body === null) {
    disabledSteps.push(3);
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
