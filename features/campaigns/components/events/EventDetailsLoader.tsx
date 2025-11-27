"use client";

interface EventDetailsLoaderProps {
  eventId: Id<"events">;
}
import { EventProvider } from "@/contexts/EventContext";
import { Id } from "convex/_generated/dataModel";
import CampaignEventUpdateGuestState from "./CampaignEventUpdateGuestState";

const EventDetailsLoader: React.FC<EventDetailsLoaderProps> = ({ eventId }) => {
  return (
    <EventProvider eventId={eventId} showSkeleton>
      <CampaignEventUpdateGuestState />
    </EventProvider>
  );
};

export default EventDetailsLoader;
