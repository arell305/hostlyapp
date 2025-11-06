"use client";

import { useContextOrganization } from "@/shared/hooks/contexts";
import { useCompanyFaqs } from "@/domain/faqs";
import FAQContent from "./FAQContent";

const FaqLoader = () => {
  const { organization } = useContextOrganization();
  const faqs = useCompanyFaqs(organization._id);

  if (!faqs) {
    return;
  }

  return <FAQContent faqs={faqs} />;
};

export default FaqLoader;
