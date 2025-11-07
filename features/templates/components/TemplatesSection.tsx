"use client";

import { useMemo, useRef, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { filterTemplatesByNameOrBody } from "@/shared/utils/format";
import TemplateContent from "./TemplateContent";
import SearchInput from "@/features/events/components/SearchInput";

interface TemplatesSectionProps {
  templates: Doc<"smsTemplates">[];
}

const TemplatesSection = ({ templates }: TemplatesSectionProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = useMemo(() => {
    return filterTemplatesByNameOrBody(templates, searchTerm);
  }, [templates, searchTerm]);

  return (
    <SectionContainer>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search templates..."
      />
      {filteredTemplates.length > 0 ? (
        <TemplateContent smsTemplates={filteredTemplates} />
      ) : (
        <p className="text-grayText">No templates found.</p>
      )}
    </SectionContainer>
  );
};

export default TemplatesSection;
