"use client";

interface EventDetailsLoaderProps {
  eventId: Id<"events">;
}
import { EventProvider } from "@/contexts/EventContext";
import { Id } from "convex/_generated/dataModel";
import CampaignEventDetails from "./CampaignEventDetails";

const EventDetailsLoader: React.FC<EventDetailsLoaderProps> = ({ eventId }) => {
  return (
    <EventProvider eventId={eventId} showSkeleton>
      <CampaignEventDetails />
    </EventProvider>
  );
};

export default EventDetailsLoader;
