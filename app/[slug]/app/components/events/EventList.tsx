"use client";

import React from "react";
import EventItem from "./EventItem";
import EmptyList from "@/components/shared/EmptyList";
import { EventSchema } from "@/types/schemas-types";

interface EventListProps {
  events: EventSchema[];
  emptyText?: string;
  className?: string;
  pathname: string;
}

const EventList: React.FC<EventListProps> = ({
  events,
  emptyText = "No events for the selected date.",
  className = "",
  pathname,
}) => {
  if (events.length === 0) {
    return <EmptyList message={emptyText} />;
  }

  return (
    <div
      className={`py-2 flex flex-wrap justify-center gap-x-4 gap-y-3  ${className}`}
    >
      {events.map((event) => (
        <EventItem key={event._id} event={event} pathname={pathname} />
      ))}
    </div>
  );
};

export default EventList;
