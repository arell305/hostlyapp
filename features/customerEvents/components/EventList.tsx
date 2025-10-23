"use client";

import EventItem from "./EventItem";
import EmptyList from "@/shared/ui/list/EmptyList";
import { EventWithExtras } from "@shared/types/convex-types";

interface EventListProps {
  events: EventWithExtras[];
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

  const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);

  return (
    <div
      className={`py-2 flex flex-wrap justify-center gap-x-4 gap-y-2 ${className}`}
    >
      {sortedEvents.map((event) => (
        <EventItem key={event._id} event={event} pathname={pathname} />
      ))}
    </div>
  );
};

export default EventList;
