"use client";

import { useMemo } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { filterTemplatesByNameOrBody } from "@/shared/utils/format";
import TemplateContent from "./TemplateContent";

interface TemplatesSectionProps {
  templates: Doc<"smsTemplates">[];
  searchTerm: string;
}

const TemplatesSection = ({ templates, searchTerm }: TemplatesSectionProps) => {
  const filteredTemplates = useMemo(() => {
    return filterTemplatesByNameOrBody(templates, searchTerm);
  }, [templates, searchTerm]);

  return (
    <SectionContainer>
      {filteredTemplates.length > 0 ? (
        <TemplateContent smsTemplates={filteredTemplates} />
      ) : (
        <p className="text-grayText">No templates found.</p>
      )}
    </SectionContainer>
  );
};

export default TemplatesSection;
