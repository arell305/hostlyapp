import SubscriptionSkeleton from "@/components/shared/skeleton/SubscriptionSkeleton";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { useCompanyFaqs } from "@/hooks/convex/faqs";
import React from "react";
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
