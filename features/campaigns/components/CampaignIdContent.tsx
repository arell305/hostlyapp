"use client";

import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import EventCampaignDetails from "./events/EventCampaignDetails";
import CampaignDetails from "./campaign/CampaignDetails";
import { useCampaignScope } from "@/shared/hooks/contexts";
import CampaignEditFormActions from "./campaign/CampaignEditFormActions";
import CampaignDetailsEdit from "./campaign/CampaignDetailsEdit";
import AiDetails from "./ai/AiDetails";
import AiDetailsEdit from "./ai/AiDetailsEdit";

const CampaignIdContent = () => {
  const { isEditing } = useCampaignScope();
  return (
    <SubPageContainer className="flex flex-col gap-8">
      {isEditing ? (
        <>
          <CampaignDetailsEdit />
          <AiDetailsEdit />
          <EventCampaignDetails />
          <CampaignEditFormActions />
        </>
      ) : (
        <>
          <CampaignDetails />
          <AiDetails />
          <EventCampaignDetails />
        </>
      )}
    </SubPageContainer>
  );
};

export default CampaignIdContent;
