"use client";

import { Doc } from "@/convex/_generated/dataModel";
import CampaignTemplateCard from "./CampaignTemplateCard";
import EmptyList from "@/shared/ui/list/EmptyList";
import { useCampaignForm } from "../../contexts/CampaignFormContext";
import CappedCardList from "@/shared/ui/containers/CappedCardList";

interface CampaignTemplateContainerProps {
  smsTemplates: Doc<"smsTemplates">[];
}
const CampaignTemplateContainer: React.FC<CampaignTemplateContainerProps> = ({
  smsTemplates,
}) => {
  const { updateFormData, setTemplateMode, setTemplate } = useCampaignForm();

  const handleTemplateSelect = (template: Doc<"smsTemplates">) => {
    updateFormData({ templateId: template._id, body: template.body });
    setTemplateMode("existing");
    setTemplate(template);
  };

  if (smsTemplates.length === 0) {
    return (
      <EmptyList
        className="mt-4"
        items={smsTemplates}
        message="No templates found."
      />
    );
  }

  return (
    <>
      <CappedCardList className="mt-4">
        {smsTemplates.map((template) => (
          <CampaignTemplateCard
            key={template._id}
            template={template}
            onSelect={handleTemplateSelect}
          />
        ))}
      </CappedCardList>
    </>
  );
};

export default CampaignTemplateContainer;
