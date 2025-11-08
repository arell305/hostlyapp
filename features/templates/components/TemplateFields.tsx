"use client";
import FormContainer from "@shared/ui/containers/FormContainer";
import LabeledInputField from "@shared/ui/fields/LabeledInputField";
import LabeledTextAreaField from "@shared/ui/fields/LabeledTextAreaField";
import { TemplateValues } from "@shared/types/types";
import PresetButtonSelector from "@/shared/ui/fields/PresetButtonSelector";
import { SmsMessageType } from "@/shared/types/enums";
import { MESSAGE_TYPE_OPTIONS, TAGS_BY_TYPE } from "@/shared/types/constants";
import { useRef } from "react";
import AiMessageGenerator from "@/features/templates/components/AiMessageGenerator";
import VariablesInserter from "@/shared/ui/fields/VariablesInserter";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAiGenerate = (generatedText: string) => {
    onChange({ body: generatedText });
  };

  const handleVariableInsert = (newValue: string, cursorPosition: number) => {
    onChange({ body: newValue });

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const availableVariables = values.messageType
    ? TAGS_BY_TYPE[values.messageType]
    : [];

  return (
    <FormContainer className={className}>
      <PresetButtonSelector
        label="Message Type"
        name="messageType"
        options={MESSAGE_TYPE_OPTIONS}
        value={values.messageType}
        onChange={(value) => onChange({ messageType: value as SmsMessageType })}
        required
      />

      <LabeledInputField
        label="Name*"
        name="name"
        value={values.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Enter name of template"
      />

      <VariablesInserter
        label="Insert Variables"
        variables={availableVariables}
        textareaValue={values.body}
        onInsert={handleVariableInsert}
        textareaRef={textareaRef}
      />

      <AiMessageGenerator onGenerate={handleAiGenerate} />

      <LabeledTextAreaField
        ref={textareaRef}
        label="Body*"
        name="body"
        value={values.body}
        onFocus={() => {
          textareaRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }}
        onChange={(e) => onChange({ body: e.target.value })}
        placeholder={
          values.messageType
            ? "Enter message or generate with AI"
            : "Select a message type first"
        }
      />

      {children}
    </FormContainer>
  );
};

export default TemplateFields;
