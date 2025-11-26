"use client";

import { useMemo, useRef, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { filterTemplatesByNameOrBody } from "@/shared/utils/format";
import TemplateContent from "./TemplateContent";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import SearchInput from "@/features/events/components/SearchInput";

interface TemplatesSectionProps {
  templates: Doc<"smsTemplates">[];
}

const TemplatesSection = ({ templates }: TemplatesSectionProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showSearch = templates.length > SEARCH_MIN_LENGTH;

  const filteredTemplates = useMemo(() => {
    return filterTemplatesByNameOrBody(templates, searchTerm);
  }, [templates, searchTerm]);

  return (
    <SectionContainer>
      {showSearch && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          placeholder="Search templates..."
        />
      )}
      <TemplateContent smsTemplates={filteredTemplates} />
    </SectionContainer>
  );
};

export default TemplatesSection;
