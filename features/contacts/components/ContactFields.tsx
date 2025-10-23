"use client";

import FormContainer from "@shared/ui/containers/FormContainer";
import LabeledInputField from "@shared/ui/fields/LabeledInputField";
import type { ContactValues } from "@shared/types/types";

export function ContactFields({
  values,
  onChange,
  className,
  children,
}: {
  values: ContactValues;
  onChange: (patch: Partial<ContactValues>) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <FormContainer className={className}>
      <LabeledInputField
        label="Name"
        type="text"
        placeholder="Enter name"
        name="name"
        value={values.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <LabeledInputField
        label="Phone Number"
        placeholder="Enter phone number"
        name="phoneNumber"
        value={values.phoneNumber}
        onChange={(e) => onChange({ phoneNumber: e.target.value })}
      />
      {children}
    </FormContainer>
  );
}
