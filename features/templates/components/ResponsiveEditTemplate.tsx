"use client";

import ResponsiveModal from "@shared/ui/responsive/ResponsiveModal";
import FormActions from "@shared/ui/buttonContainers/FormActions";
import { TemplateValues } from "@shared/types/types";
import { useUpdateSmsTemplate } from "@/domain/smsTemplates";
import React, { useState, useEffect } from "react";
import TemplateFields from "./TemplateFields";
import { Doc, Id } from "@/convex/_generated/dataModel";

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

  const resetState = () => {
    setUpdateSmsTemplateError(null);
    setValues({
      body: template.body,
      name: template.name,
      messageType: template.messageType,
    });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSave = async () => {
    const body = values.body.trim();
    const name = values.name.trim();

    if (!values.messageType || !body || !name) {
      return;
    }

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

  const isDisabled =
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
          isSubmitDisabled={isDisabled}
        />
      </TemplateFields>
    </ResponsiveModal>
  );
};

export default ResponsiveEditTemplate;
