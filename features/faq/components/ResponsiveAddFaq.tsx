"use client";

import { useInsertCompanyFaq } from "@/domain/faqs";
import ResponsiveModal from "@/shared/ui/responsive/ResponsiveModal";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { Id } from "convex/_generated/dataModel";
import { FaqValues } from "@/shared/types/types";
import { FaqFields } from "@/features/faq/components/FAQFields";
import { useState } from "react";

interface ResponsiveAddFaqProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: Id<"organizations">;
}

const ResponsiveAddFaq: React.FC<ResponsiveAddFaqProps> = ({
  isOpen,
  onOpenChange,
  organizationId,
}) => {
  const [values, setValues] = useState<FaqValues>({
    question: "",
    answer: "",
  });

  const {
    insertCompanyFaq,
    insertCompanyFaqLoading,
    insertCompanyFaqError,
    setInsertCompanyFaqError,
  } = useInsertCompanyFaq();

  const resetState = () => {
    setInsertCompanyFaqError(null);
    setValues({ question: "", answer: "" });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSave = async () => {
    const question = values.question.trim();
    const answer = values.answer.trim();

    const success = await insertCompanyFaq({
      organizationId,
      question,
      answer,
    });

    if (success) {
      handleClose();
    }
  };

  const isDisabled =
    !values.question.trim() || !values.answer.trim() || insertCompanyFaqLoading;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Add FAQ"
      description="Enter a question and answer to add a FAQ."
    >
      <FaqFields
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      >
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          isLoading={insertCompanyFaqLoading}
          submitText="Add"
          error={insertCompanyFaqError}
          isSubmitDisabled={isDisabled}
        />
      </FaqFields>
    </ResponsiveModal>
  );
};

export default ResponsiveAddFaq;
