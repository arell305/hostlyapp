"use client";

import { useMemo, useRef, useState } from "react";
import CampaignsContent from "./components/CampaignsContent";
import { Doc } from "@/convex/_generated/dataModel";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { filterCampaignsByName } from "@/shared/utils/format";
import SearchInput from "../events/components/SearchInput";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import { CampaignWithEvent } from "@/shared/types/types";

interface CampaignsSectionProps {
  campaigns: CampaignWithEvent[];
}

const CampaignsSection = ({ campaigns }: CampaignsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = useMemo(() => {
    return filterCampaignsByName(campaigns, searchTerm);
  }, [campaigns, searchTerm]);

  const showSearch = campaigns.length > SEARCH_MIN_LENGTH;

  return (
    <SectionContainer>
      {showSearch && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          placeholder="Search campaigns..."
        />
      )}
      <CampaignsContent campaigns={filteredContacts} />
    </SectionContainer>
  );
};

export default CampaignsSection;
