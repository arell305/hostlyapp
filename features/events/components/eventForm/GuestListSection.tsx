"use client";

import LabeledDateTimeField from "@/shared/ui/fields/LabeledDateTimeField";
import LabeledTextAreaField from "@/shared/ui/fields/LabeledTextAreaField";
import { useEventForm } from "@/shared/hooks/contexts";

const GuestListSection = () => {
  const {
    guestListCloseTime,
    setGuestListCloseTime,
    checkInCloseTime,
    setCheckInCloseTime,
    guestListRules,
    setGuestListRules,
    errors,
  } = useEventForm();
  return (
    <>
      <LabeledDateTimeField
        name="guestListCloseTime"
        label="Guest List Upload Close Time*"
        value={guestListCloseTime}
        onChange={setGuestListCloseTime}
        error={errors.guestListCloseTime}
      />
      <LabeledDateTimeField
        name="checkInCloseTime"
        label="Check In Close Time*"
        value={checkInCloseTime}
        onChange={setCheckInCloseTime}
        error={errors.checkInCloseTime}
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
