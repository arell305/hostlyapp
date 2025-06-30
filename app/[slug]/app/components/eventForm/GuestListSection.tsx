import React from "react";
import LabeledDateTimeField from "@/components/shared/fields/LabeledDateTimeField";
import LabeledTextAreaField from "@/components/shared/fields/LabeledTextAreaField";
import { useEventForm } from "@/contexts/EventFormContext";

interface GuestListSectionProps {}

const GuestListSection: React.FC<GuestListSectionProps> = ({}) => {
  const {
    guestListCloseTime,
    setGuestListCloseTime,
    checkInCloseTime,
    setCheckInCloseTime,
    guestListRules,
    setGuestListRules,
    errors,
    isIOSDevice,
  } = useEventForm();
  return (
    <>
      <LabeledDateTimeField
        name="guestListCloseTime"
        label="Guest List Upload Close Time*"
        value={guestListCloseTime}
        onChange={setGuestListCloseTime}
        error={errors.guestListCloseTime}
        isIOS={isIOSDevice}
      />
      <LabeledDateTimeField
        name="checkInCloseTime"
        label="Check In Close Time*"
        value={checkInCloseTime}
        onChange={setCheckInCloseTime}
        error={errors.checkInCloseTime}
        isIOS={isIOSDevice}
      />
      <LabeledTextAreaField
        name="guestListRules"
        label="Guest List Rules"
        value={guestListRules}
        onChange={(e) => {
          setGuestListRules(e.target.value);
        }}
        placeholder="Add a description for your guest list promotion."
        rows={2}
        className="w-full"
      />
    </>
  );
};

export default GuestListSection;
