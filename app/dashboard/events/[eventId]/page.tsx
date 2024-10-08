// pages/events/[id].tsx
"use client";
import { useParams } from "next/navigation";
import EventPage from "./EventPage";
import { Id } from "../../../../convex/_generated/dataModel";

export default function EventPageWrapper() {
  const params = useParams();
  const eventId = params.eventId;

  if (!eventId || typeof eventId !== "string") {
    return <div>Invalid event ID</div>;
  }

  return <EventPage eventId={eventId as Id<"events">} />;
}
