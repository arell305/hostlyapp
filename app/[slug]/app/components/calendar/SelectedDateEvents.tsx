import React from "react";
import EventList from "../events/EventList";
import { EventWithExtras } from "@/types/convex-types";

interface SelectedDateEventsProps {
  events: EventWithExtras[];
  pathname: string;
  isWeekView: boolean;
}

const SelectedDateEvents: React.FC<SelectedDateEventsProps> = ({
  events,
  pathname,
  isWeekView,
}) => {
  return (
    <div className="mt-1 mb-5">
      <div className="events-list ">
        <h3 className="font-medium text-xl md:text-2xl pb-3">
          Upcoming Events
        </h3>
        <EventList
          events={events}
          emptyText={
            isWeekView
              ? "No events found for this week."
              : "No events found for this month."
          }
          className=""
          pathname={pathname}
        />
      </div>
    </div>
  );
};

export default SelectedDateEvents;
