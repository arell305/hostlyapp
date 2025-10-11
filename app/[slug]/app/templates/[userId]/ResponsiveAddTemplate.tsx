// components/faqs/ResponsiveAddFaq.tsx
"use client";

import ResponsiveModal from "../../components/responsive/ResponsiveModal";
import FormActions from "@/components/shared/buttonContainers/FormActions";
import { Id } from "convex/_generated/dataModel";
import { TemplateValues } from "@/types/types";
import { useInsertSmsTemplate } from "@/hooks/convex/smsTemplates";
import { SmsMessageType } from "@/types/enums";
import React, { useState } from "react";
import TemplateFields from "./TemplateFields";
import { useUserScope } from "@/contexts/UserScope";

interface ResponsiveAddTemplateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResponsiveAddTemplate: React.FC<ResponsiveAddTemplateProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { userId } = useUserScope();
  const [values, setValues] = useState<TemplateValues>({
    body: "",
    name: "",
    messageType: SmsMessageType.ALL_DB_GUESTS,
  });

  const {
    insertSmsTemplate,
    insertSmsTemplateLoading,
    insertSmsTemplateError,
    setInsertSmsTemplateError,
  } = useInsertSmsTemplate();

  const resetState = () => {
    setInsertSmsTemplateError(null);
    setValues({
      body: "",
      name: "",
      messageType: SmsMessageType.ALL_DB_GUESTS,
    });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSave = async () => {
    const body = values.body.trim();
    const name = values.name.trim();

    const result = await insertSmsTemplate({
      userId,
      body,
      name,
      messageType: values.messageType,
    });

    if (result.success) {
      handleClose();
    }
  };

  const isDisabled =
    !values.body.trim() || !values.name.trim() || insertSmsTemplateLoading;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Add Template"
      description="Enter a name and body to add a template."
    >
      <TemplateFields
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      >
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          isLoading={insertSmsTemplateLoading}
          submitText="Add"
          error={insertSmsTemplateError}
          isSubmitDisabled={isDisabled}
        />
      </TemplateFields>
    </ResponsiveModal>
  );
};

export default ResponsiveAddTemplate;
