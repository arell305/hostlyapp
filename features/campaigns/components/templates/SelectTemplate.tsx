"use client";

import FormActions from "@shared/ui/buttonContainers/FormActions";
import { TemplateValues } from "@shared/types/types";
import { useState } from "react";
import TemplateFields from "@/features/templates/components/TemplateFields";
import ResponsiveHeightModal from "@/shared/ui/responsive/ResponsiveHeightModal";
import { Doc } from "@/convex/_generated/dataModel";
import { useCampaignForm } from "../../contexts/CampaignFormContext";

interface SelectTemplateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Doc<"smsTemplates">;
}

const SelectTemplate: React.FC<SelectTemplateProps> = ({
  isOpen,
  onOpenChange,
  template,
}) => {
  const { updateFormData, nextStep } = useCampaignForm();

  const [values, setValues] = useState<TemplateValues>({
    body: template?.body || "",
    name: template?.name || "",
    messageType: template?.messageType || null,
  });

  const resetState = () => {};

  const handleClose = () => {
    updateFormData({ templateId: undefined, body: undefined });
    onOpenChange(false);
  };

  const handleSave = async () => {
    const body = values.body.trim();
    const name = values.name.trim();

    if (!values.messageType || !body || !name) {
      return;
    }
    updateFormData({ templateId: template?._id || null, body });
    onOpenChange(false);
    nextStep();
  };

  const isDisabled =
    !values.body.trim() || !values.name.trim() || !values.messageType;

  return (
    <ResponsiveHeightModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="View Template"
      description="View the template details. Enter any updates."
    >
      <TemplateFields
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      >
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          isLoading={false}
          submitText="Select"
          error={null}
          isSubmitDisabled={isDisabled}
          cancelText="Deselect"
        />
      </TemplateFields>
    </ResponsiveHeightModal>
  );
};

export default SelectTemplate;
