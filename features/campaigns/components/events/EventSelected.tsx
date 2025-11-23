"use client";

import { useCampaignForm } from "../../contexts/CampaignFormContext";
import EventDetailsLoader from "./EventDetailsLoader";

const EventSelected = () => {
  const { formData } = useCampaignForm();

  if (!formData.eventId) {
    return <div>No event selected</div>;
  }

  return <EventDetailsLoader eventId={formData.eventId} />;
};

export default EventSelected;
