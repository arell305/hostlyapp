"use client";

import SearchInput from "@/features/events/components/SearchInput";
import { useRef, useState } from "react";
import CampaignTemplateLoader from "./CampaignTemplateLoader";

const CampaignTemplateQuery = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search templates..."
      />
      <CampaignTemplateLoader searchTerm={searchTerm} />
    </div>
  );
};

export default CampaignTemplateQuery;
