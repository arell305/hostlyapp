"use client";

import { Button } from "@shared/ui/primitive/button";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import CollapsibleTrigger from "@/shared/ui/buttonContainers/CollapsibleTrigger";

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
  const [isExpanded, setIsExpanded] = useState(false);

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
      <CollapsibleTrigger
        label={label}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        className={cn(isExpanded ? "" : "mb-4")}
      />

      {isExpanded && (
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
      )}
    </div>
  );
};

export default VariablesInserter;
