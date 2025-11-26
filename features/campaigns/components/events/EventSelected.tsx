"use client";

import { useCreateCampaignForm } from "../../contexts/CampaignFormContext";
import EventDetailsLoader from "./EventDetailsLoader";

const EventSelected = () => {
  const { formData } = useCreateCampaignForm();

  if (!formData.eventId) {
    return <div>No event selected</div>;
  }

  return <EventDetailsLoader eventId={formData.eventId} />;
};

export default EventSelected;
