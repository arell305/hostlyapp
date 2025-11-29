"use client";

import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";

const AudienceSelectionButton = () => {
  const { prevStep, nextStep, setEnableTemplate } = useCreateCampaignForm();

  const handleSubmit = () => {
    setEnableTemplate(true);
    nextStep();
  };
  return (
    <FormActions
      onCancel={prevStep}
      onSubmit={handleSubmit}
      isLoading={false}
      error={null}
      cancelText="Back"
      submitText="Next"
      cancelVariant="secondary"
      submitVariant="default"
      className="mt-16"
    />
  );
};

export default AudienceSelectionButton;
