import React from "react";
import { EventSchema } from "@/types/schemas-types";
import EventPreview from "./EventPreview";
import { formatLongDate } from "../../../../../utils/luxon";

interface SelectedDateEventsProps {
  date: Date;
  events: EventSchema[];
}

const SelectedDateEvents: React.FC<SelectedDateEventsProps> = ({
  date,
  events,
}) => {
  return (
    <div className="mt-1 mb-5">
      <div className="events-list mt-4">
        <h3 className="font-medium text-xl md:text-2xl  pl-4 pb-3">
          Selected Date: {formatLongDate(date)}
        </h3>
        {events.length > 0 ? (
          <div className="py-8 flex flex-wrap justify-center gap-x-4 gap-y-3 bg-gray-200 px-2">
            {events.map((event: EventSchema) => (
              <div key={event._id} className="w-full">
                <EventPreview eventData={event} isApp={true} />
              </div>
            ))}
          </div>
        ) : (
          <p className="pl-4 border-b pb-4">No events for the selected date.</p>
        )}
      </div>
    </div>
  );
};

export default SelectedDateEvents;
