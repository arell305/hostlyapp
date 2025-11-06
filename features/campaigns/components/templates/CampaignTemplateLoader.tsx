import { useUserScope } from "@/shared/hooks/contexts";
import { useSmsTemplates } from "@/domain/smsTemplates";
import CampaignTemplateContent from "./CampaignTemplateContent";

const CampaignTemplateLoader = () => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return;
  }

  return <CampaignTemplateContent smsTemplates={smsTemplates} />;
};

export default CampaignTemplateLoader;
