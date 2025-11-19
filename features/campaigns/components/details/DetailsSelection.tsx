"use client";

import LabeledDateTimeField from "@/shared/ui/fields/LabeledDateTimeField";
import { useCampaignForm } from "../../contexts/CampaignFormContext";
import { formatToDateTimeLocalPST, getCurrentTime } from "@/shared/utils/luxon";
import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import { PresetButtons } from "@/shared/ui/fields/PresetButtons";

const DetailsSelection = () => {
  const { formData, updateFormData, sendType, handleSendTypeChange } =
    useCampaignForm();
  const { sendAt } = formData;
  const min = formatToDateTimeLocalPST(getCurrentTime());

  return (
    <>
      <LabeledInputField
        name="name"
        label="Name*"
        value={formData.name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        placeholder="Enter campaign name"
      />
      <PresetButtons
        label="Send Type"
        value={sendType}
        onValueChange={handleSendTypeChange}
        presets={[
          { value: "now", label: "Now" },
          { value: "later", label: "Later" },
        ]}
      />
      {sendType === "later" && (
        <LabeledDateTimeField
          name="sendTime"
          label="Send Time*"
          value={sendAt ?? null}
          onChange={(val) => {
            updateFormData({ sendAt: val ?? undefined });
          }}
          min={min}
        />
      )}
    </>
  );
};

export default DetailsSelection;
