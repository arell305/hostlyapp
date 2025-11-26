"use client";

import { useSmsTemplate } from "@/domain/smsTemplates";
import { useCreateCampaignForm } from "@/features/campaigns/contexts/CampaignFormContext";
import EditableTemplate from "./EditableTemplate";
import EventCardsSkeleton from "@/shared/ui/skeleton/EventCardSkeleton";

const SelectedTemplate: React.FC = () => {
  const { formData } = useCreateCampaignForm();

  const smsTemplate = useSmsTemplate(formData.templateId);

  if (!smsTemplate) {
    return <EventCardsSkeleton />;
  }

  return <EditableTemplate smsTemplate={smsTemplate} />;
};

export default SelectedTemplate;
