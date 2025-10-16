"use client";

import * as React from "react";
import FormContainer from "@/components/shared/containers/FormContainer";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import LabeledTextAreaField from "@/components/shared/fields/LabeledTextAreaField";
import type { FaqValues } from "@/types/types";

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
