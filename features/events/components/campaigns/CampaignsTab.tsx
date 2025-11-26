"use client";

import { Doc } from "@/convex/_generated/dataModel";
import CampaignsContent from "@/features/campaigns/components/CampaignsContent";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import { filterCampaignsByName } from "@/shared/utils/format";
import { useMemo, useRef, useState } from "react";
import SearchInput from "../SearchInput";
import SubPageContainer from "@/shared/ui/containers/SubPageContainer";

interface CampaignsTabProps {
  campaigns: Doc<"campaigns">[];
}

const CampaignsTab = ({ campaigns }: CampaignsTabProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const showSearch = campaigns.length > SEARCH_MIN_LENGTH;

  const filteredCampaigns = useMemo(() => {
    return filterCampaignsByName(campaigns, searchTerm);
  }, [campaigns, searchTerm]);

  return (
    <SubPageContainer className="gap-4 flex flex-col">
      {showSearch && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
        />
      )}
      <CampaignsContent campaigns={filteredCampaigns} />
    </SubPageContainer>
  );
};

export default CampaignsTab;
