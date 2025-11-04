"use client";

import { Textarea } from "@shared/ui/primitive/textarea";
import { Label } from "@shared/ui/primitive/label";
import FieldErrorMessage from "../error/FieldErrorMessage";
import LabelWrapper from "./LabelWrapper";
import { forwardRef } from "react";

interface LabeledTextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
  className?: string;
  name: string;
}

const LabeledTextAreaField = forwardRef<
  HTMLTextAreaElement,
  LabeledTextAreaFieldProps
>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      error,
      className = "",
      name,
      ...rest
    },
    ref
  ) => {
    return (
      <div>
        <LabelWrapper>
          <Label htmlFor={name}>{label}</Label>
          <Textarea
            ref={ref}
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${error ? "border-red-500" : ""} ${className}`}
            {...rest}
          />
        </LabelWrapper>
        <FieldErrorMessage error={error} />
      </div>
    );
  }
);

LabeledTextAreaField.displayName = "LabeledTextAreaField";

export default LabeledTextAreaField;
