"use client";

import { useUserScope } from "@/shared/hooks/contexts";
import { useSmsTemplates } from "@/domain/smsTemplates";
import CampaignTemplateContent from "./CampaignTemplateContent";

interface CampaignTemplateLoaderProps {
  searchTerm: string;
}

const CampaignTemplateLoader: React.FC<CampaignTemplateLoaderProps> = ({
  searchTerm,
}) => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return;
  }

  return (
    <CampaignTemplateContent
      smsTemplates={smsTemplates}
      searchTerm={searchTerm}
    />
  );
};

export default CampaignTemplateLoader;
