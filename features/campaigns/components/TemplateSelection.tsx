"use client";

import SectionContainer from "@/shared/ui/containers/SectionContainer";
import CampaignTemplateLoader from "./templates/CampaignTemplateLoader";
import { Button } from "@/shared/ui/primitive/button";
import ResponsiveAddTemplate from "@/features/templates/components/ResponsiveAddTemplate";
import { useState } from "react";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { useCampaignForm } from "../contexts/CampaignFormContext";
import SelectTemplate from "./templates/SelectTemplate";

const TemplateSelection = () => {
  const [isAddingTemplate, setIsAddingTemplate] = useState<boolean>(false);
  const { prevStep, nextStep, formData } = useCampaignForm();

  const handleAddNewTemplate = () => {
    setIsAddingTemplate(true);
  };

  const isNextDisabled = formData.templateId === null;
  return (
    <SectionContainer>
      {" "}
      <div className="flex  justify-between">
        <h2>Select Template</h2>
        <Button
          variant="secondaryAction"
          className="rounded-md w-auto"
          onClick={handleAddNewTemplate}
          size="xs"
        >
          Add New Template
        </Button>
      </div>
      <CampaignTemplateLoader />
      <SelectTemplate
        isOpen={isAddingTemplate}
        onOpenChange={setIsAddingTemplate}
      />
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
    </SectionContainer>
  );
};

export default TemplateSelection;
