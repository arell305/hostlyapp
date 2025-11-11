"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import CampaignTemplateCard from "./CampaignTemplateCard";
import EmptyList from "@/shared/ui/list/EmptyList";
import { useCampaignForm } from "../../contexts/CampaignFormContext";
import CappedCardList from "@/shared/ui/containers/CappedCardList";
import { useState } from "react";
import SelectTemplate from "./SelectTemplate";

interface CampaignTemplateContainerProps {
  smsTemplates: Doc<"smsTemplates">[];
}
const CampaignTemplateContainer: React.FC<CampaignTemplateContainerProps> = ({
  smsTemplates,
}) => {
  const [isSelectingTemplate, setIsSelectingTemplate] =
    useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<Doc<"smsTemplates"> | null>(null);
  const { updateFormData, formData } = useCampaignForm();

  const handleTemplateSelect = (templateId: Id<"smsTemplates"> | null) => {
    setIsSelectingTemplate(true);
    setSelectedTemplate(
      smsTemplates.find((template) => template._id === templateId) || null
    );
  };

  const isCustomTemplate = formData.templateId === null && formData.body !== "";

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
        {isCustomTemplate && (
          <CampaignTemplateCard
            name={"Custom Template"}
            body={formData.body || ""}
            templateId={formData.templateId || null}
            onSelect={handleTemplateSelect}
            isSelected={formData.templateId === formData.templateId}
          />
        )}
        {smsTemplates.map((template) => (
          <CampaignTemplateCard
            key={template._id}
            name={template.name}
            body={template.body}
            templateId={template._id}
            onSelect={handleTemplateSelect}
            isSelected={formData.templateId === template._id}
          />
        ))}
      </CappedCardList>
      {selectedTemplate && (
        <SelectTemplate
          isOpen={isSelectingTemplate}
          onOpenChange={setIsSelectingTemplate}
          template={selectedTemplate}
        />
      )}
    </>
  );
};

export default CampaignTemplateContainer;
