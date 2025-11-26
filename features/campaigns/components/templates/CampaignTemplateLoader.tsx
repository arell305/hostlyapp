"use client";

import { useUserScope } from "@/shared/hooks/contexts";
import { useSmsTemplates } from "@/domain/smsTemplates";
import CampaignTemplateContent from "./CampaignTemplateContent";
import TemplatesSkeleton from "@/shared/ui/skeleton/TemplatesSkeleton";

const CampaignTemplateLoader = () => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return <TemplatesSkeleton className="mt-4" />;
  }

  return <CampaignTemplateContent smsTemplates={smsTemplates} />;
};

export default CampaignTemplateLoader;
