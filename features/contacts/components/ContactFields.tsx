"use client";

import FormContainer from "@shared/ui/containers/FormContainer";
import LabeledInputField from "@shared/ui/fields/LabeledInputField";
import type { ContactValues } from "@shared/types/types";
import PhoneNumberInput from "@/shared/ui/fields/PhoneNumberInput";

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
        label="Name*"
        type="text"
        placeholder="Enter name"
        name="name"
        value={values.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <PhoneNumberInput
        label="Phone Number*"
        value={values.phoneNumber ?? ""}
        onChange={(val) => onChange({ phoneNumber: val })}
        placeholder="Enter phone number"
        name="phoneNumber"
      />
      {children}
    </FormContainer>
  );
}
