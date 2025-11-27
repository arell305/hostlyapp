"use client";

import SectionContainer from "@/shared/ui/containers/SectionContainer";
import SectionBodyContainer from "@/shared/ui/containers/SectionBodyContainer";
import AudienceSelection from "./AudienceSelection";
import AudienceSelectionButton from "./AudienceSlectionButton";

const AudienceSection = () => {
  return (
    <SectionContainer className="gap-0">
      <SectionBodyContainer>
        <h2>Choose Audience</h2>

        <AudienceSelection />
      </SectionBodyContainer>
      <AudienceSelectionButton />
    </SectionContainer>
  );
};

export default AudienceSection;
