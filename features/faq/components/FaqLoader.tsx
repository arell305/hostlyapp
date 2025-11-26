"use client";

import { useContextOrganization } from "@/shared/hooks/contexts";
import { useCompanyFaqs } from "@/domain/faqs";
import FaqCardsSkeleton from "@/shared/ui/skeleton/FaqCardSkeleton";
import FaqSection from "./FaqSection";

const FaqLoader = () => {
  const { organization } = useContextOrganization();
  const faqs = useCompanyFaqs(organization._id);

  if (!faqs) {
    return <FaqCardsSkeleton />;
  }

  return <FaqSection faqs={faqs} />;
};

export default FaqLoader;
