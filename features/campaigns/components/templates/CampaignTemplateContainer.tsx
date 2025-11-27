"use client";

import { Doc } from "@/convex/_generated/dataModel";
import CampaignTemplateCard from "./CampaignTemplateCard";
import EmptyList from "@/shared/ui/list/EmptyList";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";
import CappedCardList from "@/shared/ui/containers/CappedCardList";
import {
  hasEventRequiredVariables,
  hasGuestListVariables,
} from "@/shared/utils/uiHelpers";

interface CampaignTemplateContainerProps {
  smsTemplates: Doc<"smsTemplates">[];
}

const CampaignTemplateContainer: React.FC<CampaignTemplateContainerProps> = ({
  smsTemplates,
}) => {
  const {
    updateFormData,
    setTemplateMode,
    setTemplate,
    formData,
    hasGuestList,
  } = useCreateCampaignForm();

  const handleTemplateSelect = (template: Doc<"smsTemplates">) => {
    updateFormData({ templateId: template._id, body: template.body });
    setTemplateMode("existing");
    setTemplate(template);
  };

  const filteredTemplates = smsTemplates.filter((template) => {
    const needsEvent = hasEventRequiredVariables(template.body);
    const needsGuestList = hasGuestListVariables(template.body);
    if (needsEvent && !formData.eventId) {
      return false;
    }
    if (hasGuestList && !needsGuestList) {
      return false;
    }

    return true;
  });

  if (filteredTemplates.length === 0) {
    return (
      <EmptyList
        className=""
        items={filteredTemplates}
        message="No templates found."
      />
    );
  }

  return (
    <CappedCardList>
      {filteredTemplates.map((template) => (
        <CampaignTemplateCard
          key={template._id}
          template={template}
          onSelect={handleTemplateSelect}
        />
      ))}
    </CappedCardList>
  );
};

export default CampaignTemplateContainer;
