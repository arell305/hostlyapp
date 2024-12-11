import { EventData } from "@/types";
import React from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { formatDateMDY, formatTime } from "../../../../utils/helpers";
import { LuMapPin } from "react-icons/lu";

interface DetailsViewProps {
  eventData: EventData;
}

const DetailsView: React.FC<DetailsViewProps> = ({ eventData }) => {
  return (
    <div className="flex flex-col  rounded border border-altGray w-[400px] p-3 shadow">
      <h2 className="text-2xl font-playfair font-bold mb-1 text-center md:text-start">
        {eventData.name}
      </h2>
      <div className="space-y-2">
        <div className="flex space-x-2 items-center">
          <MdOutlineCalendarToday className="text-xl" />
          <p>{formatDateMDY(eventData.startTime)}</p>
        </div>
        <div className="flex space-x-2 items-center">
          <FiClock className="text-xl" />
          <p>{formatTime(eventData.startTime)}</p>
        </div>
        {eventData.venue && eventData.venue?.venueName !== "" && (
          <div className="flex space-x-2 items-center">
            <LuMapPin className="text-xl" />
            <p>{eventData.venue.venueName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsView;
