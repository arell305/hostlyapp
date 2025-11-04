"use client";

import {
  CAMPAIGN_FORM_STEPS,
  useCampaignForm,
} from "../contexts/CampaignFormContext";
import Stepper from "@shared/ui/stepper/Stepper";

const LABELS: Record<string, string> = {
  event: "Event",
  template: "Template",
  details: "Details",
};

type LocalCampaignFormStep = (typeof CAMPAIGN_FORM_STEPS)[number];

const CampaignStepper: React.FC = () => {
  const { currentStep, goToStep } = useCampaignForm();
  const steps = CAMPAIGN_FORM_STEPS.map((key) => ({ label: LABELS[key] }));
  const currentIndex = CAMPAIGN_FORM_STEPS.indexOf(
    currentStep as LocalCampaignFormStep
  );
  const numericCurrent = currentIndex + 1;

  const handleStepClick = (stepNumber: number) => {
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
    />
  );
};

export default CampaignStepper;
