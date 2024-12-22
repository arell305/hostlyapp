import { EventData } from "@/types";
import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { MdOutlineCalendarToday } from "react-icons/md";
import { formatDateMDY, formatTime } from "../../../../utils/helpers";
import { IoTicketOutline } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import EventFormSkeleton from "../loading/EventFormSkeleton";
interface EventPreviewProps {
  eventData: EventData;
}

const EventPreview: React.FC<EventPreviewProps> = ({ eventData }) => {
  const displayEventPhoto = eventData.photo
    ? useQuery(api.photo.getFileUrl, { storageId: eventData.photo })
    : null;

  return (
    <Link href={`/events/${eventData._id}`} className="">
      <div className="w-[190px] h-[400px] shadow cursor-pointer hover:bg-gray-100 p-2 rounded-md transition duration-200 bg-white">
        {displayEventPhoto === undefined && <EventFormSkeleton />}
        {displayEventPhoto === null ? (
          <div className="w-full h-[217px] mb-2 bg-gray-200 rounded-lg animate-pulse"></div>
        ) : (
          <img
            src={displayEventPhoto}
            alt={eventData.name}
            className="w-full h-[217px] mb-2 rounded-lg" // Adjust styles as needed
          />
        )}

        <h2 className=" font-playfair font-bold mb-1 text-center ">
          {eventData.name}
        </h2>
        <div className="text-xs space-y-2 border-b-2 border-customLightGray">
          <div className="flex space-x-2 items-center">
            <MdOutlineCalendarToday />
            <p>{formatDateMDY(eventData.startTime)}</p>
          </div>
          <div className="flex space-x-2 items-center">
            <FiClock />
            <p>{formatTime(eventData.startTime)}</p>
          </div>
          {eventData.venue && eventData.venue?.venueName !== "" && (
            <div className="flex space-x-2 items-center">
              <LuMapPin />
              <p>{eventData.venue.venueName}</p>
            </div>
          )}
          <div className="pb-1"></div>
        </div>
        <div
          className={`flex text-xs ${
            eventData.ticketInfoId && eventData.guestListInfoId
              ? "justify-between"
              : "justify-center"
          }`}
        >
          {eventData.ticketInfoId && (
            <div
              className={`pt-1 w-1/2 flex flex-col justify-center items-center ${
                eventData.ticketInfoId && eventData.guestListInfoId
                  ? "border-r-2 border-customLightGray"
                  : ""
              }`}
            >
              <p>Ticket</p>
              <IoTicketOutline />
            </div>
          )}
          {eventData.guestListInfoId && (
            <div className="pt-1 w-1/2 flex flex-col justify-center items-center">
              <p>Guest List</p>
              <LuClipboardList />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventPreview;
