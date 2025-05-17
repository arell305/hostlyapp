import React from "react";
import { EventSchema } from "@/types/schemas-types";
import { formatLongDate } from "../../../../../utils/luxon";
import EventList from "../events/EventList";

interface SelectedDateEventsProps {
  date: Date;
  events: EventSchema[];
  pathname: string;
}

const SelectedDateEvents: React.FC<SelectedDateEventsProps> = ({
  date,
  events,
  pathname,
}) => {
  return (
    <div className="mt-1 mb-5">
      <div className="events-list mt-4">
        <h3 className="font-medium text-xl md:text-2xl  pl-4 md:pl-0 pb-3">
          Selected Date: {formatLongDate(date)}
        </h3>
        <EventList
          events={events}
          emptyText="No upcoming events found."
          className=""
          pathname={pathname}
        />
      </div>
    </div>
  );
};

export default SelectedDateEvents;
