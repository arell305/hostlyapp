"use client";

import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import LabeledTextAreaField from "@/shared/ui/fields/LabeledTextAreaField";
import LabeledAddressAutoComplete from "@/shared/ui/fields/LabeledAddressAutoComplete";
import LabeledDateTimeField from "@/shared/ui/fields/LabeledDateTimeField";
import { convertToPstTimestamp } from "@/shared/utils/luxon";
import { AddressValue } from "@shared/types/types";
import EventPhotoSection from "@/features/events/components/eventForm/EventPhotoSection";
import { useEventForm } from "@/contexts/EventFormContext";

interface EventDetailsSectionProps {
  isEdit?: boolean;
}

const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({
  isEdit = false,
}) => {
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
      <EventPhotoSection isEdit={isEdit} />
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
