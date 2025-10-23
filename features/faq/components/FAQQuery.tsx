"use client";

import SubscriptionSkeleton from "@shared/ui/skeleton/SubscriptionSkeleton";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { useCompanyFaqs } from "@/domain/faqs";
import FAQContent from "./FAQContent";

const FAQQuery = () => {
  const { organization } = useContextOrganization();
  const faqs = useCompanyFaqs(organization._id);

  if (!faqs) {
    return <SubscriptionSkeleton />;
  }

  return <FAQContent faqs={faqs} />;
};

export default FAQQuery;
