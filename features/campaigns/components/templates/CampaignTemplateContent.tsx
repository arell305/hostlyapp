"use client";

import { Doc } from "@/convex/_generated/dataModel";
import SearchInput from "@/features/events/components/SearchInput";
import { useRef, useState } from "react";
import CampaignTemplateContainer from "./CampaignTemplateContainer";

interface CampaignTemplateContentProps {
  smsTemplates: Doc<"smsTemplates">[];
}
const CampaignTemplateContent: React.FC<CampaignTemplateContentProps> = ({
  smsTemplates,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTemplates = smsTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search templates..."
      />

      <CampaignTemplateContainer smsTemplates={filteredTemplates} />
    </div>
  );
};

export default CampaignTemplateContent;
