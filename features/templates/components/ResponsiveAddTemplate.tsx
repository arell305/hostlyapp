"use client";

import FormActions from "@shared/ui/buttonContainers/FormActions";
import { TemplateValues } from "@shared/types/types";
import { useInsertSmsTemplate } from "@/domain/smsTemplates";
import { useState } from "react";
import TemplateFields from "./TemplateFields";
import { useUserScope } from "@/shared/hooks/contexts";
import ResponsiveHeightModal from "@/shared/ui/responsive/ResponsiveHeightModal";

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
    });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSave = async () => {
    const body = values.body.trim();
    const name = values.name.trim();

    if (!body || !name) {
      return;
    }

    const success = await insertSmsTemplate({
      userId,
      body,
      name,
    });

    if (success) {
      handleClose();
    }
  };

  const isDisabled =
    !values.body.trim() || !values.name.trim() || insertSmsTemplateLoading;

  return (
    <ResponsiveHeightModal
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
    </ResponsiveHeightModal>
  );
};

export default ResponsiveAddTemplate;
