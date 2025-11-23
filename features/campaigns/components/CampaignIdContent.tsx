"use client";

import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import EventCampaignDetails from "./events/EventCampaignDetails";
import CampaignDetails from "./campaign/CampaignDetails";
import { useCampaignScope } from "@/shared/hooks/contexts";
import CampaignEditFormActions from "./campaign/CampaignEditFormActions";
import CampaignDetailsEdit from "./campaign/CampaignDetailsEdit";

const CampaignIdContent = () => {
  const { isEditing } = useCampaignScope();
  return (
    <SubPageContainer className="flex flex-col gap-8">
      {isEditing ? (
        <>
          <CampaignDetailsEdit />
          <EventCampaignDetails />
          <CampaignEditFormActions />
        </>
      ) : (
        <>
          <CampaignDetails />
          <EventCampaignDetails />
        </>
      )}
    </SubPageContainer>
  );
};

export default CampaignIdContent;
