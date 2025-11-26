"use client";

import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";

const TemplateSelectionButton = () => {
  const { prevStep, nextStep, formData } = useCreateCampaignForm();

  const isNextDisabled = formData.body === null;

  return (
    <FormActions
      onCancel={prevStep}
      onSubmit={nextStep}
      isSubmitDisabled={isNextDisabled}
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

export default TemplateSelectionButton;
