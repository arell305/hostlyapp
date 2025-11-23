"use client";

import { useCampaignScope } from "@/shared/hooks/contexts";
import { useCampaignForm } from "@/shared/hooks/contexts/campaign/useCampaignForm";
import FormContainer from "@/shared/ui/containers/FormContainer";
import LabeledDateTimeField from "@/shared/ui/fields/LabeledDateTimeField";
import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import { PresetButtons } from "@/shared/ui/fields/PresetButtons";
import { formatToDateTimeLocalPST, getCurrentTime } from "@/shared/utils/luxon";

const CampaignDetailsEdit = () => {
  const { formData, updateFormData, sendType, handleSendTypeChange } =
    useCampaignForm();
  const { campaign } = useCampaignScope();
  const { name, scheduleTime } = formData;
  const min = formatToDateTimeLocalPST(getCurrentTime());

  const isUnsent = campaign.status !== "Sent";

  return (
    <FormContainer>
      <LabeledInputField
        name="name"
        label="Name*"
        value={name}
        onChange={(e) => updateFormData({ name: e.target.value })}
        placeholder="Enter campaign name"
      />
      {isUnsent && (
        <>
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
              value={scheduleTime ?? null}
              onChange={(val) => {
                updateFormData({ scheduleTime: val ?? undefined });
              }}
              min={min}
            />
          )}
        </>
      )}
    </FormContainer>
  );
};

export default CampaignDetailsEdit;
