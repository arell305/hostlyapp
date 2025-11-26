"use client";

import { Doc } from "@/convex/_generated/dataModel";
import CampaignTemplateContainer from "./CampaignTemplateContainer";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import SearchInput from "@/features/events/components/SearchInput";
import { useState, useRef, useMemo } from "react";
import { filterTemplatesByNameOrBody } from "@/shared/utils/format";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";

interface CampaignTemplateContentProps {
  smsTemplates: Doc<"smsTemplates">[];
}
const CampaignTemplateContent: React.FC<CampaignTemplateContentProps> = ({
  smsTemplates,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = useMemo(
    () => filterTemplatesByNameOrBody(smsTemplates, searchTerm),
    [smsTemplates, searchTerm]
  );

  const showSearch = smsTemplates.length > SEARCH_MIN_LENGTH;

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
      <CampaignTemplateContainer smsTemplates={filteredTemplates} />
    </SectionContainer>
  );
};

export default CampaignTemplateContent;
