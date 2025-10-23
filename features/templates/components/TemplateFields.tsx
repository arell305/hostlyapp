"use client";
import FormContainer from "@shared/ui/containers/FormContainer";
import LabeledInputField from "@shared/ui/fields/LabeledInputField";
import LabeledTextAreaField from "@shared/ui/fields/LabeledTextAreaField";
import { TemplateValues } from "@shared/types/types";

interface TemplateFieldsProps {
  values: TemplateValues;
  onChange: (patch: Partial<TemplateValues>) => void;
  className?: string;
  children?: React.ReactNode;
}
const TemplateFields = ({
  values,
  onChange,
  className,
  children,
}: TemplateFieldsProps) => {
  return (
    <FormContainer className={className}>
      <LabeledInputField
        label="Name"
        name="name"
        value={values.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Enter name of template"
      />
      <LabeledTextAreaField
        label="Body"
        name="body"
        value={values.body}
        onChange={(e) => onChange({ body: e.target.value })}
        placeholder="Enter message"
      />
      {children}
    </FormContainer>
  );
};

export default TemplateFields;
