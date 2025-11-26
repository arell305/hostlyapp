"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useCampaignsByEventId } from "@/domain/campaigns";
import CampaignsTab from "./CampaignsTab";
import CampaignCardsSkeleton from "@/shared/ui/skeleton/CampaignCardsSkeleton";

interface CampaignLoaderByEventProps {
  eventId: Id<"events">;
}

const CampaignLoaderByEvent: React.FC<CampaignLoaderByEventProps> = ({
  eventId,
}) => {
  const campaigns = useCampaignsByEventId(eventId);

  if (!campaigns) {
    return <CampaignCardsSkeleton />;
  }

  return <CampaignsTab campaigns={campaigns} />;
};

export default CampaignLoaderByEvent;
