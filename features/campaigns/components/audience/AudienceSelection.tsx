"use client";

import { PresetButtons } from "@/shared/ui/fields/PresetButtons";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";
import { AudienceType } from "@/shared/types/types";

const AudienceSelection = () => {
  const { formData, updateFormData, hasGuestList } = useCreateCampaignForm();
  const { audienceType } = formData;

  const presets = hasGuestList
    ? [
        { value: "All Contacts" as const, label: "All Contacts" },
        {
          value: "All Guest List Guests" as const,
          label: "All Guest List Guests",
        },
        {
          value: "Attended Guest List Guests" as const,
          label: "Attended Only",
        },
        {
          value: "Not Attended Guest List Guests" as const,
          label: "Not Attended",
        },
      ]
    : [{ value: "All Contacts" as const, label: "All Contacts" }];
  return (
    <PresetButtons
      label="Type"
      value={audienceType}
      onValueChange={(value) =>
        updateFormData({ audienceType: value as AudienceType })
      }
      presets={presets}
      stacked
    />
  );
};

export default AudienceSelection;
