import React from "react";
import { formatLongDate } from "../../../../../utils/luxon";
import EventList from "../events/EventList";
import { EventWithExtras } from "@/types/convex-types";

interface SelectedDateEventsProps {
  date: Date;
  events: EventWithExtras[];
  pathname: string;
}

const SelectedDateEvents: React.FC<SelectedDateEventsProps> = ({
  date,
  events,
  pathname,
}) => {
  return (
    <div className="mt-1 mb-5">
      <div className="events-list ">
        <h3 className="font-medium text-xl md:text-2xl pb-3">
          {formatLongDate(date)}
        </h3>
        <EventList
          events={events}
          emptyText="No events found for this date."
          className=""
          pathname={pathname}
        />
      </div>
    </div>
  );
};

export default SelectedDateEvents;
