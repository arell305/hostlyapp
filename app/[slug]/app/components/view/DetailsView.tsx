import React from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import EventFormSkeleton from "../loading/EventFormSkeleton";
import { formatTime, formatDateMDY } from "../../../../../utils/luxon";
import { EventSchema } from "@/types/schemas-types";
import _ from "lodash";
import Image from "next/image";

interface DetailsViewProps {
  eventData: EventSchema;
}

const DetailsView: React.FC<DetailsViewProps> = ({ eventData }) => {
  const displayEventPhoto = useQuery(
    api.photo.getFileUrl,
    eventData.photo ? { storageId: eventData.photo } : "skip"
  );

  const handleAddressClick = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.address)}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="flex flex-col rounded border border-altGray w-[400px] p-3 shadow bg-white">
      {displayEventPhoto === undefined && <EventFormSkeleton />}
      {displayEventPhoto ? (
        // Placeholder skeleton
        <Image
          src={displayEventPhoto}
          alt={eventData.name || "Event photo"}
          className="w-full h-auto mb-2 rounded-lg"
        />
      ) : (
        <div className="w-full h-[200px] mb-2 bg-gray-200 rounded-lg animate-pulse"></div>
      )}
      <h2 className="text-2xl font-playfair font-bold mb-1 text-center md:text-start">
        {_.capitalize(eventData.name) || "Event Name"}
      </h2>
      <div className="space-y-2">
        <div className="flex space-x-2 items-center">
          <MdOutlineCalendarToday className="text-xl" />
          <p>
            {eventData.startTime ? formatDateMDY(eventData.startTime) : "TBD"}
          </p>
        </div>
        <div className="flex space-x-2 items-center">
          <FiClock className="text-xl" />
          <p>{`${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}`}</p>
        </div>
        <div
          className="flex items-start space-x-2 cursor-pointer underline hover:text-blue-700 hover:underline"
          onClick={handleAddressClick}
        >
          <LuMapPin className="text-xl flex-shrink-0" />
          <p className="">{eventData.address}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailsView;
