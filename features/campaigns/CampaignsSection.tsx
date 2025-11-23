"use client";

import { useMemo } from "react";
import CampaignsContent from "./components/CampaignsContent";
import { Doc } from "@/convex/_generated/dataModel";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { filterCampaignsByName } from "@/shared/utils/format";

interface CampaignsSectionProps {
  campaigns: Doc<"campaigns">[];
  searchTerm: string;
}

const CampaignsSection = ({ campaigns, searchTerm }: CampaignsSectionProps) => {
  const filteredContacts = useMemo(() => {
    return filterCampaignsByName(campaigns, searchTerm);
  }, [campaigns, searchTerm]);

  return (
    <SectionContainer>
      <CampaignsContent campaigns={filteredContacts} />
    </SectionContainer>
  );
};

export default CampaignsSection;
