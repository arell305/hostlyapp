"use client";

import { useEffect, useMemo, useState } from "react";
import ResponsiveModal from "@/shared/ui/responsive/ResponsiveModal";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import PhoneNumberInput from "@/shared/ui/fields/PhoneNumberInput";
import FormContainer from "@/shared/ui/containers/FormContainer";
import { hasFormValue } from "@/shared/utils/helpers";
import { isValidPhoneNumber } from "libphonenumber-js";

type GuestEditValues = {
  name: string;
  phoneNumber: string;
};

type Errors = {
  name?: string;
  phoneNumber?: string;
};

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  initialPhoneNumber?: string | null;
  onSave: (name: string, phoneNumber: string | null) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
};

const ResponsiveEditGuestName: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  initialName,
  initialPhoneNumber = "",
  onSave,
  isLoading = false,
  error = null,
}) => {
  const [values, setValues] = useState<GuestEditValues>({
    name: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (isOpen) {
      setValues({
        name: initialName || "",
        phoneNumber: initialPhoneNumber || "",
      });
      setErrors({});
    }
  }, [isOpen, initialName, initialPhoneNumber]);

  const hasChanges = useMemo(() => {
    const trimmedName = values.name.trim();
    const trimmedPhone = values.phoneNumber.trim();
    const origName = (initialName || "").trim();
    const origPhone = (initialPhoneNumber || "").trim();

    return trimmedName !== origName || trimmedPhone !== origPhone;
  }, [values.name, values.phoneNumber, initialName, initialPhoneNumber]);

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!hasFormValue(values.name)) {
      newErrors.name = "Name is required";
    }

    if (
      hasFormValue(values.phoneNumber) &&
      !isValidPhoneNumber(values.phoneNumber, "US")
    ) {
      newErrors.phoneNumber = "Phone number must be at least 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidPhone =
    hasFormValue(values.phoneNumber) &&
    isValidPhoneNumber(values.phoneNumber, "US");

  const isSubmitDisabled =
    !hasChanges || isLoading || !hasFormValue(values.name) || !isValidPhone;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formattedPhone =
      values.phoneNumber.trim() === "" ? null : values.phoneNumber.trim();

    const success = await onSave(values.name.trim(), formattedPhone);
    if (success) {
      handleClose();
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Edit Guest"
      description="Update the name and optional phone number of the guest."
    >
      <FormContainer>
        <LabeledInputField
          label="Name"
          name="name"
          placeholder="Enter name"
          value={values.name}
          onChange={(e) => {
            setValues((v) => ({ ...v, name: e.target.value }));
            setErrors((e) => ({ ...e, name: undefined }));
          }}
          error={errors.name}
          required
        />

        <PhoneNumberInput
          label="Phone Number (Optional)"
          placeholder="Enter phone number"
          value={values.phoneNumber}
          onChange={(phone) => {
            setValues((v) => ({ ...v, phoneNumber: phone }));
            setErrors((e) => ({ ...e, phoneNumber: undefined }));
          }}
          error={errors.phoneNumber}
          name="phoneNumber"
        />

        <FormActions
          onCancel={handleClose}
          onSubmit={handleSave}
          submitText="Save"
          cancelText="Cancel"
          isLoading={isLoading}
          error={error}
          isSubmitDisabled={isSubmitDisabled}
        />
      </FormContainer>
    </ResponsiveModal>
  );
};

export default ResponsiveEditGuestName;
