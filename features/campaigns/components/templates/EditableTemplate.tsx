"use client";

import { Doc } from "@/convex/_generated/dataModel";
import TemplateFields from "@/features/templates/components/TemplateFields";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";
import { TemplateValues } from "@/shared/types/types";
import { getVariableFilter } from "@/shared/utils/uiHelpers";

interface EditableTemplateProps {
  smsTemplate?: Doc<"smsTemplates">;
}

const EditableTemplate: React.FC<EditableTemplateProps> = ({ smsTemplate }) => {
  const { formData, updateFormData, bodyError, hasGuestList } =
    useCreateCampaignForm();

  const body = formData.body ?? smsTemplate?.body ?? "";

  const handleChange = (patch: Partial<TemplateValues>) => {
    updateFormData(patch);
  };

  const variableFilter = getVariableFilter({
    eventId: formData.eventId,
    hasGuestList,
  });

  return (
    <TemplateFields
      showName={false}
      values={{ body, name: "custom" }}
      onChange={handleChange}
      bodyError={bodyError}
      variableFilter={variableFilter}
    />
  );
};

export default EditableTemplate;
