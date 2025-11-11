"use client";

import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import EventCampaignDetails from "./events/EventCampaignDetails";
import CampaignDetails from "./campaign/CampaignDetails";

const CampaignIdContent = () => {
  return (
    <SubPageContainer className="flex flex-col gap-8">
      <CampaignDetails />
      <EventCampaignDetails />
    </SubPageContainer>
  );
};

export default CampaignIdContent;
