import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { MdOutlineCalendarToday } from "react-icons/md";
import { IoTicketOutline } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatDateMDY, formatTime } from "../../../../../utils/luxon";
import { usePathname } from "next/navigation";
import _ from "lodash";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getTextBeforeComma } from "../../../../../utils/string";
import { EventSchema, TicketInfoSchema } from "@/types/schemas-types";
import { isTicketSalesOpen } from "@/lib/frontendHelper";
import IconTextRow from "../ui/IconTextRow";

interface EventPreviewProps {
  eventData: EventSchema;
  isApp: boolean;
  ticketInfo?: TicketInfoSchema | null;
}

const EventPreview: React.FC<EventPreviewProps> = ({
  eventData,
  isApp,
  ticketInfo,
}) => {
  const displayEventPhoto = useQuery(
    api.photo.getFileUrl,
    eventData.photo
      ? {
          storageId: eventData.photo,
        }
      : "skip"
  );
  const pathname = usePathname();

  const isSalesOpen = isTicketSalesOpen(ticketInfo);

  return (
    <Link href={`${pathname}/events/${eventData._id}`} className="">
      <div
        className={`w-full md:w-[220px] md:h-[${isApp ? "380" : "340"}px] shadow-md cursor-pointer hover:shadow-xl rounded-md transition duration-200 bg-cardBackground pb-1`}
      >
        <div
          className={`flex items-center justify-between pl-4 py-2 ${!displayEventPhoto ? "mb-2" : ""}`}
        >
          <h2 className={`font-playfair font-bold text-2xl md:text-base `}>
            {_.capitalize(eventData.name)}
          </h2>
          {isSalesOpen && (
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-100 mr-4"
            >
              Tickets On Sale
            </Badge>
          )}
        </div>
        {displayEventPhoto && (
          <div className="relative w-full aspect-[4/5]">
            <Image
              src={displayEventPhoto}
              alt="Company Avatar"
              fill
              className="object-cover "
              sizes="160px"
            />
          </div>
        )}

        <div className={` px-1 md:text-xs ${isApp ? "border-b" : ""}`}>
          <IconTextRow
            icon={<MdOutlineCalendarToday />}
            text={formatDateMDY(eventData.startTime)}
          />
          <IconTextRow
            icon={<FiClock />}
            text={formatTime(eventData.startTime)}
          />
          <IconTextRow
            icon={<LuMapPin />}
            text={getTextBeforeComma(eventData.address)}
            isLastItem={true}
          />
          <div className="pb-1"></div>
        </div>
        {isApp && (
          <div
            className={`flex text-base md:text-xs py-1 ${
              eventData.ticketInfoId && eventData.guestListInfoId
                ? "justify-between"
                : "justify-center"
            }`}
          >
            {eventData.ticketInfoId && (
              <div
                className={`py-3 w-1/2 flex space-x-2 font-medium justify-center items-center ${
                  eventData.ticketInfoId && eventData.guestListInfoId
                    ? "border-r-2 border-customLightGray"
                    : ""
                }`}
              >
                <IoTicketOutline className="text-2xl md:text-base" />
                <p>Tickets</p>
              </div>
            )}
            {eventData.guestListInfoId && (
              <div className="py-3 w-1/2 flex space-x-2 font-medium justify-center items-center ">
                <LuClipboardList className="text-2xl md:text-base" />
                <p>Guest List</p>
              </div>
            )}
            {!eventData.guestListInfoId && !eventData.ticketInfoId && (
              <div className="mt-1.5 pt-1 w-1/2 flex flex-col font-medium justify-center items-center md:text-base">
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
