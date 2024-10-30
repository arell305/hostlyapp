// // pages/events/[id].tsx
"use client";
import { useParams } from "next/navigation";
import EventPage from "./EventPage";
import { Id } from "../../../../convex/_generated/dataModel";
import { v } from "convex/values";
import { useState, useEffect } from "react";

export default function EventPageWrapper() {
  const params = useParams();
  const eventId = params.eventId;
  return <EventPage eventId={eventId as Id<"events">} />;
}
