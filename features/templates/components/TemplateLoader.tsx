"use client";

import { useSmsTemplates } from "@/domain/smsTemplates";
import TemplateContent from "./TemplateContent";
import { useUserScope } from "@/shared/hooks/contexts";

const TemplatesLoader = () => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return;
  }

  return <TemplateContent smsTemplates={smsTemplates} />;
};

export default TemplatesLoader;
