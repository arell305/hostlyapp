"use client";

import { useCampaignScope } from "@/shared/hooks/contexts";

import CampaignEventDetails from "./CampaignEventDetails";

const EventCampaignDetails = () => {
  const { campaign } = useCampaignScope();

  const hasEvent = campaign.eventId !== null;
  if (!hasEvent) {
    return <p>No event associated with this campaign.</p>;
  }

  return <CampaignEventDetails />;
};

export default EventCampaignDetails;
