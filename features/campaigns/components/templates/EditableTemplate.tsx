"use client";

import { Doc } from "@/convex/_generated/dataModel";
import TemplateFields from "@/features/templates/components/TemplateFields";
import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";
import { TemplateValues } from "@/shared/types/types";

interface EditableTemplateProps {
  smsTemplate?: Doc<"smsTemplates">;
}
const EditableTemplate: React.FC<EditableTemplateProps> = ({ smsTemplate }) => {
  const { formData, updateFormData, templateMode } = useCreateCampaignForm();

  const values =
    templateMode === "existing" && smsTemplate
      ? {
          name: smsTemplate.name,
          messageType: smsTemplate.messageType,
          body: smsTemplate.body,
        }
      : {
          name: "custom",
          messageType: null,
          body: formData.body ?? "",
        };

  const handleChange = (patch: Partial<TemplateValues>) => {
    updateFormData(patch);
  };

  return (
    <TemplateFields showName={false} values={values} onChange={handleChange} />
  );
};

export default EditableTemplate;
