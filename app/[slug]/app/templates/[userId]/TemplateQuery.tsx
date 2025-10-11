import SubscriptionSkeleton from "@/components/shared/skeleton/SubscriptionSkeleton";
import React from "react";
import { useSmsTemplates } from "@/hooks/convex/smsTemplates";
import TemplateContent from "./TemplateContent";
import { useUserScope } from "@/contexts/UserScope";

const TemplatesQuery = () => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return <SubscriptionSkeleton />;
  }

  return <TemplateContent smsTemplates={smsTemplates} />;
};

export default TemplatesQuery;
