"use client";

import LabeledDateTimeField from "@/shared/ui/fields/LabeledDateTimeField";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";
import { formatToDateTimeLocalPST, getCurrentTime } from "@/shared/utils/luxon";
import LabeledInputField from "@/shared/ui/fields/LabeledInputField";
import { PresetButtons } from "@/shared/ui/fields/PresetButtons";
import LabeledTextAreaField from "@/shared/ui/fields/LabeledTextAreaField";
import ToggleButton from "@/shared/ui/buttonContainers/ToggleButton";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";

const DetailsSelection = () => {
  const { formData, updateFormData, sendType, handleSendTypeChange } =
    useCreateCampaignForm();
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
      <ToggleTabs
        options={[
          { label: "No", value: "no" },
          { label: "Yes", value: "yes" },
        ]}
        value={formData.enableAiReplies ? "yes" : "no"}
        onChange={(value) =>
          updateFormData({ enableAiReplies: value === "yes" ? true : false })
        }
        className="mb-4"
        label="Enable AI Replies"
      />
      {formData.enableAiReplies && (
        <>
          <ToggleTabs
            options={[
              { label: "No", value: "no" },
              { label: "Yes", value: "yes" },
            ]}
            value={formData.includeFaqInAiReplies ? "yes" : "no"}
            onChange={(value) =>
              updateFormData({
                includeFaqInAiReplies: value === "yes" ? true : false,
              })
            }
            className="mb-4"
            label="Include FAQ in AI Replies"
          />
          <LabeledTextAreaField
            name="aiPrompt"
            label="AI Prompt"
            value={formData.aiPrompt ?? ""}
            onChange={(e) => updateFormData({ aiPrompt: e.target.value })}
            placeholder="Enter AI prompt"
            rows={2}
          />
        </>
      )}
      <PresetButtons
        label="Send Type"
        value={sendType}
        onValueChange={handleSendTypeChange}
        presets={[
          { value: "now", label: "Now" },
          { value: "later", label: "Later" },
        ]}
        stacked
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
