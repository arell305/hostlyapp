"use client";

import EventList from "@/features/customerEvents/components/EventList";
import { EventWithExtras } from "@/shared/types/convex-types";

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
  const title = isWeekView ? "Events This Week" : "Events This Month";
  return (
    <div className="mt-1 mb-5">
      <div className="events-list ">
        <h3 className="font-medium text-xl md:text-2xl pb-3">{title}</h3>
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
