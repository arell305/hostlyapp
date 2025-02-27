import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { MdOutlineCalendarToday } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import EventFormSkeleton from "../loading/EventFormSkeleton";
import { formatDateMDY, formatTime } from "../../../../../utils/luxon";
import { usePathname } from "next/navigation";
import _ from "lodash";
import { EventSchema } from "@/types/schemas-types";
interface EventPreviewProps {
  eventData: EventSchema;
  isApp: boolean;
}

const EventPreview: React.FC<EventPreviewProps> = ({ eventData, isApp }) => {
  const displayEventPhoto = eventData.photo
    ? useQuery(api.photo.getFileUrl, { storageId: eventData.photo })
    : null;
  const pathname = usePathname();

  return (
    <Link href={`${pathname}/events/${eventData._id}`} className="">
      {/* <div className="w-[190px] h-[400px] shadow cursor-pointer hover:bg-gray-100 p-2 rounded-md transition duration-200 bg-white"> */}
      <div
        className={`w-[190px] h-[${isApp ? "380" : "340"}px] shadow cursor-pointer hover:bg-gray-100 p-2 rounded-md transition duration-200 bg-white`}
      >
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
          {_.capitalize(eventData.name)}
        </h2>
        <div className={`text-xs space-y-2 ${isApp ? "border-b" : ""} `}>
          {/* <div className="text-xs space-y-2 border-b-2 border-customLightGray"> */}
          <div className="flex space-x-2 items-center">
            <MdOutlineCalendarToday />
            <p>{formatDateMDY(eventData.startTime)}</p>
          </div>
          <div className="flex space-x-2 items-center">
            <FiClock />
            <p>{formatTime(eventData.startTime)}</p>
          </div>
          {eventData.address && (
            <div className="flex space-x-2 items-center">
              <LuMapPin />
              <p>{eventData.address}</p>
            </div>
          )}
          <div className="pb-1"></div>
        </div>
        {isApp && (
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
            {!eventData.guestListInfoId && !eventData.ticketInfoId && (
              <div className="mt-1.5 pt-1 w-1/2 flex flex-col justify-center items-center">
                <p>Event Only</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventPreview;
