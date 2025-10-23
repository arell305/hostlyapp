"use client";

import FormContainer from "@shared/ui/containers/FormContainer";
import LabeledInputField from "@shared/ui/fields/LabeledInputField";
import LabeledTextAreaField from "@shared/ui/fields/LabeledTextAreaField";
import type { FaqValues } from "@shared/types/types";

export function FaqFields({
  values,
  onChange,
  className,
  children,
}: {
  values: FaqValues;
  onChange: (patch: Partial<FaqValues>) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <FormContainer className={className}>
      <LabeledInputField
        label="Question"
        type="text"
        placeholder="Enter question"
        name="question"
        value={values.question}
        onChange={(e) => onChange({ question: e.target.value })}
      />
      <LabeledTextAreaField
        label="Answer"
        placeholder="Enter answer"
        name="answer"
        value={values.answer}
        onChange={(e) => onChange({ answer: e.target.value })}
      />
      {children}
    </FormContainer>
  );
}
