"use client";

import { Button } from "@shared/ui/primitive/button";
import { cn } from "@/shared/lib/utils";
import { InsertableVariable } from "@/shared/utils/uiHelpers";

interface VariablesInserterProps {
  variables: InsertableVariable[];
  textareaValue: string;
  onInsert: (newValue: string, cursorPosition: number) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  className?: string;
}

const VariablesInserter: React.FC<VariablesInserterProps> = ({
  variables,
  textareaValue,
  onInsert,
  textareaRef,
  className = "",
}) => {
  const insertVariable = (variableKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variable = `{{${variableKey}}}`;

    const newValue =
      textareaValue.slice(0, start) + variable + textareaValue.slice(end);

    onInsert(newValue, start + variable.length);
  };

  return (
    <div className={cn(className)}>
      <h3>Variables</h3>
      <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
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
