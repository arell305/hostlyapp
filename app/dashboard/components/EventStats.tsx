import { PLUS_GUEST_LIST_LIMIT } from "@/constants";
import React from "react";
import { IoCalendarClearOutline } from "react-icons/io5";
import { MdListAlt } from "react-icons/md";

// Utility function to format the date
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

interface EventSummaryProps {
  nextResetDate: string; // ISO string for the reset date
  numberOfEvents?: number;
}

const EventSummary: React.FC<EventSummaryProps> = ({
  nextResetDate,
  numberOfEvents,
}) => {
  if (numberOfEvents === undefined) return null;

  const totalEvents = PLUS_GUEST_LIST_LIMIT;

  return (
    <div className="flex space-x-4 max-w-[820px] mb-4">
      {/* Card for Remaining Guest List Events */}
      <div className="bg-white shadow-lg rounded-lg p-6 flex-1 w-[300px]">
        <div className="flex items-center">
          <MdListAlt className="h-6 w-6 text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Guest List Events</p>
            <p className="text-lg font-semibold text-gray-800">
              {numberOfEvents} / {totalEvents}
            </p>
          </div>
        </div>
      </div>

      {/* Card for Next Reset Date */}
      <div className="bg-white shadow-lg rounded-lg p-6 flex-1  w-[300px]">
        <div className="flex items-center">
          <IoCalendarClearOutline className="h-6 w-6 text-green-500 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Next Reset Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(nextResetDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSummary;
