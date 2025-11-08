"use client";

import { useUpdateCompanyFaq } from "@/domain/faqs";
import ResponsiveModal from "@/shared/ui/responsive/ResponsiveModal";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { Doc } from "convex/_generated/dataModel";
import { FaqValues } from "@/shared/types/types";
import { FaqFields } from "@/features/faq/components/FAQFields";
import { useEffect, useState } from "react";

interface ResponsiveEditFaqProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  faq: Doc<"faq"> | null;
}

const ResponsiveEditFaq: React.FC<ResponsiveEditFaqProps> = ({
  isOpen,
  onOpenChange,
  faq,
}) => {
  const [values, setValues] = useState<FaqValues>({
    question: "",
    answer: "",
  });

  const {
    updateCompanyFaq,
    updateCompanyFaqLoading,
    updateCompanyFaqError,
    setUpdateCompanyFaqError,
  } = useUpdateCompanyFaq();

  useEffect(() => {
    if (faq) {
      setValues({ question: faq.question, answer: faq.answer });
    }
  }, [faq]);

  const resetState = () => {
    setUpdateCompanyFaqError(null);
    setValues({ question: "", answer: "" });
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!faq?._id) {
      return;
    }
    const question = values.question.trim();
    const answer = values.answer.trim();

    const success = await updateCompanyFaq({
      faqId: faq._id,
      updates: {
        question,
        answer,
      },
    });

    if (success) {
      handleClose();
    }
  };

  const isDisabled =
    !values.question.trim() || !values.answer.trim() || updateCompanyFaqLoading;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Edit FAQ"
      description="Enter a question and answer to edit a FAQ."
    >
      <FaqFields
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      >
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          isLoading={updateCompanyFaqLoading}
          submitText="Save"
          error={updateCompanyFaqError}
          isSubmitDisabled={isDisabled}
        />
      </FaqFields>
    </ResponsiveModal>
  );
};

export default ResponsiveEditFaq;
