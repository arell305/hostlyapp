// EventDetailsSection.tsx
import React from "react";
import LabeledInputField from "@/components/shared/fields/LabeledInputField";
import LabeledTextAreaField from "@/components/shared/fields/LabeledTextAreaField";
import LabeledAddressAutoComplete from "@/components/shared/fields/LabeledAddressAutoComplete";
import LabeledDateTimeField from "@/components/shared/fields/LabeledDateTimeField";
import { timestampToPstString, convertToPstTimestamp } from "@/utils/luxon";
import { AddressValue } from "@/types/types";
import EventPhotoSection from "./EventPhotoSection";
import { useEventForm } from "@/contexts/EventFormContext";

interface EventDetailsSectionProps {}

const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({}) => {
  const {
    eventName,
    setEventName,
    description,
    setDescription,
    address,
    setAddress,
    value,
    setValue,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    errors,
    setErrors,
    isIOSDevice,
  } = useEventForm();
  const handleDateTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: number | null) => void
  ) => {
    const timestamp = convertToPstTimestamp(e.target.value);
    setter(timestamp);
  };

  const handleSelect = (v: AddressValue | null) => {
    setValue(v);
    if (v) setAddress(v.label);
  };

  const clearInput = () => {
    setValue(null);
    setAddress("");
  };

  return (
    <>
      <EventPhotoSection />
      <LabeledInputField
        name="eventName"
        label="Name*"
        placeholder="Enter event name"
        value={eventName}
        onChange={(e) => {
          setEventName(e.target.value);
          setErrors((prev: typeof errors) => ({
            ...prev,
            eventName: undefined,
          }));
        }}
        error={errors.eventName}
      />
      <LabeledTextAreaField
        name="description"
        label="Description"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          setErrors((prev: typeof errors) => ({
            ...prev,
            description: undefined,
          }));
        }}
        placeholder="Add a description for your event."
        rows={6}
        className="w-full"
      />
      <LabeledAddressAutoComplete
        label="Address*"
        address={address || ""}
        onSelect={handleSelect}
        value={value}
        error={errors.address}
        clearInput={clearInput}
      />
      <LabeledDateTimeField
        name="startTime"
        label="Starts*"
        value={startTime} // ✅ pass number directly
        onChange={(val) => {
          setStartTime(val);
          setErrors((prev: typeof errors) => ({
            ...prev,
            startTime: undefined,
          }));
        }}
        error={errors.startTime}
        isIOS={isIOSDevice}
      />

      <LabeledDateTimeField
        name="endTime"
        label="Ends*"
        value={endTime}
        onChange={(val) => {
          setEndTime(val);
          setErrors((prev: typeof errors) => ({
            ...prev,
            endTime: undefined,
          }));
        }}
        error={errors.endTime}
        isIOS={isIOSDevice}
      />
    </>
  );
};

export default EventDetailsSection;
