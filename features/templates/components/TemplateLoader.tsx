"use client";

import { useSmsTemplates } from "@/domain/smsTemplates";
import { useUserScope } from "@/shared/hooks/contexts";
import TemplatesSection from "./TemplatesSection";

const TemplatesLoader = () => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return;
  }

  return <TemplatesSection templates={smsTemplates} />;
};

export default TemplatesLoader;
