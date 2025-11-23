"use client";

import SectionContainer from "@/shared/ui/containers/SectionContainer";
import SectionBodyContainer from "@/shared/ui/containers/SectionBodyContainer";
import CampaignTemplateHeader from "./templates/CampaignTemplateHeader";
import CampaignTemplateBody from "./templates/CampaignTemplateBody";
import TemplateSelectionButton from "./templates/TemplateSelectionButton";

const TemplateSelection = () => {
  return (
    <SectionContainer className="gap-0">
      <SectionBodyContainer>
        <CampaignTemplateHeader />
        <CampaignTemplateBody />
      </SectionBodyContainer>
      <TemplateSelectionButton />
    </SectionContainer>
  );
};

export default TemplateSelection;
