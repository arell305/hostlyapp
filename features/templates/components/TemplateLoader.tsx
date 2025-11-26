"use client";

import { useSmsTemplates } from "@/domain/smsTemplates";
import { useUserScope } from "@/shared/hooks/contexts";
import TemplatesSection from "./TemplatesSection";
import TemplatesSkeleton from "@/shared/ui/skeleton/TemplatesSkeleton";

const TemplatesLoader = () => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return <TemplatesSkeleton />;
  }

  return <TemplatesSection templates={smsTemplates} />;
};

export default TemplatesLoader;
