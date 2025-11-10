"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
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
  const { updateFormData, nextStep, formData } = useCampaignForm();

  const handleTemplateSelect = (templateId: Id<"smsTemplates">) => {
    updateFormData({ templateId });
    nextStep();
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
    <CappedCardList className="mt-4">
      {smsTemplates.map((template) => (
        <CampaignTemplateCard
          key={template._id}
          template={template}
          onSelect={handleTemplateSelect}
          isSelected={formData.templateId === template._id}
        />
      ))}
    </CappedCardList>
  );
};

export default CampaignTemplateContainer;
