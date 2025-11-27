"use client";

import { useCampaignScope } from "@/shared/hooks/contexts";
import { useCampaignForm } from "@/shared/hooks/contexts/campaign/useCampaignForm";
import AiDetails from "./AiDetails";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import LabeledTextAreaField from "@/shared/ui/fields/LabeledTextAreaField";

const AiDetailsEdit = () => {
  const { formData, updateFormData } = useCampaignForm();
  const { campaign } = useCampaignScope();

  if (campaign.status !== "Scheduled") {
    return <AiDetails />;
  }
  return (
    <>
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
    </>
  );
};

export default AiDetailsEdit;
