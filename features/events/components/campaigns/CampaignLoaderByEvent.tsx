"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useCampaignsByEventId } from "@/domain/campaigns";
import CampaignsContent from "@/features/campaigns/components/CampaignsContent";

interface CampaignLoaderByEventProps {
  eventId: Id<"events">;
}

const CampaignLoaderByEvent: React.FC<CampaignLoaderByEventProps> = ({
  eventId,
}) => {
  const campaigns = useCampaignsByEventId(eventId);

  if (!campaigns) {
    return;
  }

  return <CampaignsContent campaigns={campaigns} />;
};

export default CampaignLoaderByEvent;
