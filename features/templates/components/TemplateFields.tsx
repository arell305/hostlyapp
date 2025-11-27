"use client";
import FormContainer from "@shared/ui/containers/FormContainer";
import LabeledInputField from "@shared/ui/fields/LabeledInputField";
import LabeledTextAreaField from "@shared/ui/fields/LabeledTextAreaField";
import { TemplateValues } from "@shared/types/types";
import { getFilteredVariables } from "@/shared/utils/uiHelpers";
import { useRef, useState } from "react";
import AiMessageGenerator from "@/features/templates/components/AiMessageGenerator";
import VariablesInserter from "@/shared/ui/fields/VariablesInserter";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import { cn } from "@/shared/lib/utils";

interface TemplateFieldsProps {
  values: TemplateValues;
  onChange: (patch: Partial<TemplateValues>) => void;
  className?: string;
  children?: React.ReactNode;
  showName?: boolean;
  bodyError?: string | null;
  variableFilter?: "all" | "noEvent" | "noGuestList";
}

const TemplateFields = ({
  values,
  onChange,
  className,
  children,
  showName = true,
  bodyError,
  variableFilter = "all",
}: TemplateFieldsProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messageType, setMessageType] = useState<"manual" | "ai">("manual");

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

  return (
    <FormContainer className={cn("space-y-4", className)}>
      {showName && (
        <LabeledInputField
          label="Name*"
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter template name"
          name="name"
        />
      )}

      <VariablesInserter
        variables={getFilteredVariables(variableFilter)}
        textareaValue={values.body}
        onInsert={handleVariableInsert}
        textareaRef={textareaRef}
      />
      <ToggleTabs
        options={[
          { label: "Manual", value: "manual" },
          { label: "Generate with AI", value: "ai" },
        ]}
        value={messageType}
        onChange={setMessageType}
        className="mb-4"
      />
      {messageType === "ai" && (
        <AiMessageGenerator onGenerate={handleAiGenerate} />
      )}
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
        placeholder="Enter message or generate with AI"
        error={bodyError}
      />

      {children}
    </FormContainer>
  );
};

export default TemplateFields;
