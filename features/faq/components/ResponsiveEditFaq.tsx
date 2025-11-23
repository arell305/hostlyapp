"use client";

import { useUpdateCompanyFaq } from "@/domain/faqs";
import ResponsiveModal from "@/shared/ui/responsive/ResponsiveModal";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { Doc } from "convex/_generated/dataModel";
import { FaqValues } from "@/shared/types/types";
import { FaqFields } from "@/features/faq/components/FAQFields";
import { useEffect, useMemo, useState } from "react";

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
      setValues({
        question: faq.question ?? "",
        answer: faq.answer ?? "",
      });
    }
  }, [faq]);

  const hasChanges = useMemo(() => {
    if (!faq) return false;
    const trimmedQuestion = values.question.trim();
    const trimmedAnswer = values.answer.trim();
    const originalQuestion = (faq.question ?? "").trim();
    const originalAnswer = (faq.answer ?? "").trim();
    return (
      trimmedQuestion !== originalQuestion || trimmedAnswer !== originalAnswer
    );
  }, [values.question, values.answer, faq]);

  const handleClose = () => {
    setUpdateCompanyFaqError(null);
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!faq?._id || !hasChanges) return;

    const success = await updateCompanyFaq({
      faqId: faq._id,
      updates: {
        question: values.question.trim(),
        answer: values.answer.trim(),
      },
    });

    if (success) {
      handleClose();
    }
  };

  const isSubmitDisabled =
    !hasChanges ||
    !values.question.trim() ||
    !values.answer.trim() ||
    updateCompanyFaqLoading ||
    !faq?._id;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Edit FAQ"
      description="Update the question and answer for this FAQ."
    >
      <FaqFields
        values={values}
        onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
      >
        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          isLoading={updateCompanyFaqLoading}
          submitText="Save Changes"
          error={updateCompanyFaqError}
          isSubmitDisabled={isSubmitDisabled}
        />
      </FaqFields>
    </ResponsiveModal>
  );
};

export default ResponsiveEditFaq;
