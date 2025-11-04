"use client";

import { Button } from "@shared/ui/primitive/button";
import { Label } from "@shared/ui/primitive/label";
import { cn } from "@/shared/lib/utils";

interface InsertableVariable {
  key: string;
  label: string;
}

interface VariablesInserterProps {
  label: string;
  variables: InsertableVariable[];
  textareaValue: string;
  onInsert: (newValue: string, cursorPosition: number) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  className?: string;
}

const VariablesInserter: React.FC<VariablesInserterProps> = ({
  label,
  variables,
  textareaValue,
  onInsert,
  textareaRef,
  className = "",
}) => {
  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variable = `{${variableKey}}`;

    const newValue =
      textareaValue.slice(0, start) + variable + textareaValue.slice(end);

    onInsert(newValue, start + variable.length);
  };

  return (
    <div className={cn(className)}>
      <Label className="=font-medium mb-2 block">{label}</Label>
      <div className="flex flex-wrap gap-2 mb-6">
        {variables.map((variable) => (
          <Button
            key={variable.key}
            type="button"
            variant="selection"
            size="xs"
            onClick={() => insertVariable(variable.key)}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {variable.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VariablesInserter;
