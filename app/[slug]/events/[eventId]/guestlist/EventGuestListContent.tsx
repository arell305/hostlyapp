import React, { useState } from "react";
import { GuestListInfoSchema } from "@/types/schemas-types";
import { useAddPublicGuestListEntry } from "./hooks/addPublicGuestListEntry";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import SingleSubmitButton from "@/components/shared/buttonContainers/SingleSubmitButton";
import { validatePublicGuestListForm } from "@/utils/form-validation/validatePublicGuestList";
import { Button } from "@/components/ui/button";
import PhoneNumberInput from "@/components/shared/fields/PhoneNumberInput";
import {
  isValidFullName,
  isValidPhoneNumber,
} from "@/utils/frontend-validation";

interface EventGuestListContentProps {
  guestListInfo: GuestListInfoSchema;
  onBrowseMore?: () => void;
}

const EventGuestListContent = ({
  guestListInfo,
  onBrowseMore,
}: EventGuestListContentProps) => {
  const {
    addEntry,
    isLoading,
    error: addEntryError,
  } = useAddPublicGuestListEntry();

  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [errors, setErrors] = useState<{
    name?: string;
    phoneNumber?: string;
  }>({});

  const isGuestListClosed = Date.now() > guestListInfo.guestListCloseTime;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { errors: fieldErrors, isValid } = validatePublicGuestListForm({
      name,
      phoneNumber,
    });
    if (!isValid) {
      setErrors(fieldErrors);
      return;
    }

    addEntry(guestListInfo.eventId, name, phoneNumber).then((success) => {
      if (success) {
        setErrors({});
        setIsSubmitted(true);
      }
    });
  };

  const isSubmitDisabled =
    isLoading || !isValidPhoneNumber(phoneNumber) || !isValidFullName(name);

  if (isGuestListClosed) {
    return (
      <div className="py-6 text-center">
        <p className="text-xl font-semibold text-red-600 mb-4">
          🚫 Guest list is now closed.
        </p>
        <Button onClick={onBrowseMore}>Browse More Events</Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="py-6 text-center">
        <p className="text-xl font-medium mb-4">
          🎉 You&apos;re on the guest list!
        </p>
        <Button onClick={onBrowseMore}>Browse More Events</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-4 w-full">
      <div className="">
        <p className="text-xl font-medium mb-4">
          {guestListInfo.guestListRules}
        </p>
      </div>
      <LabeledInputField
        name="name"
        label="Full Name*"
        placeholder="Enter your full name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={errors.name}
      />
      <PhoneNumberInput
        name="phoneNumber"
        label="Phone Number*"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChange={(value) => {
          setPhoneNumber(value);
          setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
        }}
        error={errors.phoneNumber}
      />
      <SingleSubmitButton
        className="pt-0"
        isLoading={isLoading}
        disabled={isSubmitDisabled}
        onClick={(e) => handleSubmit(e as React.FormEvent<HTMLFormElement>)}
        label="Add to Guest List"
        error={addEntryError}
      />
    </form>
  );
};

export default EventGuestListContent;
