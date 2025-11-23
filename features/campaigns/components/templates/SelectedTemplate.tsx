"use client";

import { useSmsTemplate } from "@/domain/smsTemplates";
import { useCampaignForm } from "@/features/campaigns/contexts/CampaignFormContext";
import EditableTemplate from "./EditableTemplate";

const SelectedTemplate: React.FC = () => {
  const { formData } = useCampaignForm();

  const smsTemplate = useSmsTemplate(formData.templateId);

  if (!smsTemplate) {
    return null;
  }

  return <EditableTemplate smsTemplate={smsTemplate} />;
};

export default SelectedTemplate;
