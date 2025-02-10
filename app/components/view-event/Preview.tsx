import { EventData } from "@/types/types";
import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { MdOutlineCalendarToday } from "react-icons/md";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useRouter, usePathname } from "next/navigation";

import EventFormSkeleton from "@/[companyName]/app/components/loading/EventFormSkeleton";
import { api } from "../../../convex/_generated/api";
import { getTextBeforeComma } from "../../../utils/helpers";
import { formatDateMDY, formatTime } from "../../../utils/luxon";

interface PreviewCardProps {
  eventData: EventData;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ eventData }) => {
  const router = useRouter();
  const pathname = usePathname();

  const displayEventPhoto = eventData.photo
    ? useQuery(api.photo.getFileUrl, { storageId: eventData.photo })
    : null;

  return (
    <div
      onClick={() => router.push(`${pathname}/${eventData._id}`)}
      className="w-[500px] mx-3 shadow cursor-pointer md:hover:bg-gray-50 p-2 rounded-md transition duration-200 bg-white flex overflow-hidden"
    >
      <div className="w-[100px] h-[100px] flex-shrink-0 mr-4">
        {displayEventPhoto === undefined && <EventFormSkeleton />}
        {displayEventPhoto === null ? (
          <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse"></div>
        ) : (
          <img
            src={displayEventPhoto}
            alt={eventData.name}
            className="w-full h-full rounded-lg object-cover"
          />
        )}
      </div>

      <div className="flex-grow overflow-hidden">
        <h2 className="font-playfair font-bold mb-1">
          {eventData.name.toUpperCase()}
        </h2>
        <div className="text-sm space-y-1">
          <div className="flex space-x-2 items-center">
            <MdOutlineCalendarToday className="flex-shrink-0" />
            <p className="font-semibold">
              {formatDateMDY(eventData.startTime)}
            </p>
          </div>
          <div className="flex space-x-2 items-center">
            <FiClock className="flex-shrink-0" />
            <p>{formatTime(eventData.startTime)}</p>
          </div>
          <div className="flex space-x-2 items-center">
            <LuMapPin className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                {getTextBeforeComma(eventData.address)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;
