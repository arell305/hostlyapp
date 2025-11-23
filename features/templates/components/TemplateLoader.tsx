"use client";

import { useSmsTemplates } from "@/domain/smsTemplates";
import { useUserScope } from "@/shared/hooks/contexts";
import TemplatesSection from "./TemplatesSection";

interface TemplatesLoaderProps {
  searchTerm: string;
}

const TemplatesLoader = ({ searchTerm }: TemplatesLoaderProps) => {
  const { userId } = useUserScope();
  const smsTemplates = useSmsTemplates(userId);

  if (!smsTemplates) {
    return;
  }

  return <TemplatesSection templates={smsTemplates} searchTerm={searchTerm} />;
};

export default TemplatesLoader;
