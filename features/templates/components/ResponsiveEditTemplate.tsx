"use client";

import ResponsiveModal from "@shared/ui/responsive/ResponsiveModal";
import FormActions from "@shared/ui/buttonContainers/FormActions";
import { TemplateValues } from "@shared/types/types";
import { useUpdateSmsTemplate } from "@/domain/smsTemplates";
import { useState, useEffect, useMemo } from "react";
import TemplateFields from "./TemplateFields";
import { Doc } from "@/convex/_generated/dataModel";

interface ResponsiveEditTemplateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: Doc<"smsTemplates">;
}

const ResponsiveEditTemplate: React.FC<ResponsiveEditTemplateProps> = ({
  isOpen,
  onOpenChange,
  template,
}) => {
  const [values, setValues] = useState<TemplateValues>({
    body: template.body,
    name: template.name,
    messageType: template.messageType,
  });

  const {
    updateSmsTemplate,
    updateSmsTemplateLoading,
    updateSmsTemplateError,
    setUpdateSmsTemplateError,
  } = useUpdateSmsTemplate();

  useEffect(() => {
    if (isOpen) {
      setValues({
        body: template.body,
        name: template.name,
        messageType: template.messageType,
      });
    }
  }, [isOpen, template]);

  const hasChanges = useMemo(() => {
    const trimmedBody = values.body.trim();
    const trimmedName = values.name.trim();
    const trimmedMessageType = values.messageType;

    return (
      trimmedBody !== template.body.trim() ||
      trimmedName !== template.name.trim() ||
      trimmedMessageType !== template.messageType
    );
  }, [values.body, values.name, values.messageType, template]);

  const handleClose = () => {
    setUpdateSmsTemplateError(null);
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    const body = values.body.trim();
    const name = values.name.trim();

    if (!values.messageType || !body || !name) return;

    const success = await updateSmsTemplate({
      smsTemplateId: template._id,
      updates: {
        body,
        name,
        messageType: values.messageType,
      },
    });

    if (success) {
      handleClose();
    }
  };

  const isSubmitDisabled =
    !hasChanges ||
    !values.body.trim() ||
    !values.name.trim() ||
    !values.messageType ||
    updateSmsTemplateLoading;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Edit Template"
      description="Update your SMS template."
    >
      <TemplateFields
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
        className=""
      >
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          isLoading={updateSmsTemplateLoading}
          submitText="Save Changes"
          error={updateSmsTemplateError}
          isSubmitDisabled={isSubmitDisabled}
        />
      </TemplateFields>
    </ResponsiveModal>
  );
};

export default ResponsiveEditTemplate;
