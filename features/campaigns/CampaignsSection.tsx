"use client";

import React, { useMemo, useRef, useState } from "react";
import CampaignsContent from "./components/CampaignsContent";
import { Doc } from "@/convex/_generated/dataModel";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import SearchInput from "../events/components/SearchInput";
import { filterCampaignsByName } from "@/shared/utils/format";

interface CampaignsSectionProps {
  campaigns: Doc<"campaigns">[];
}

const CampaignsSection = ({ campaigns }: CampaignsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = useMemo(() => {
    return filterCampaignsByName(campaigns, searchTerm);
  }, [campaigns, searchTerm]);

  return (
    <SectionContainer>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search campaigns..."
      />
      <CampaignsContent campaigns={filteredContacts} />
    </SectionContainer>
  );
};

export default CampaignsSection;
