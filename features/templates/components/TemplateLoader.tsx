"use client";

import SubscriptionSkeleton from "@shared/ui/skeleton/SubscriptionSkeleton";
import { useSmsTemplates } from "@/domain/smsTemplates";
import TemplateContent from "./TemplateContent";
import { useUserScope } from "@/contexts/UserScope";

const TemplatesLoader = () => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return <SubscriptionSkeleton />;
  }

  return <TemplateContent smsTemplates={smsTemplates} />;
};

export default TemplatesLoader;
