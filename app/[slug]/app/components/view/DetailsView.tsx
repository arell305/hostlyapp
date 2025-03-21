import React from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import EventFormSkeleton from "../loading/EventFormSkeleton";
import { formatTime, formatDateMDY } from "../../../../../utils/luxon";
import { EventSchema, TicketInfoSchema } from "@/types/schemas-types";
import _ from "lodash";
import Image from "next/image";
import IconTextRow from "../../components/ui/IconTextRow";
import AddressTextRow from "../../components/ui/AddressTextRow";
import { Badge } from "@/components/ui/badge";
import { isTicketSalesOpen } from "@/lib/frontendHelper";

interface DetailsViewProps {
  eventData: EventSchema;
  ticketInfoData?: TicketInfoSchema | null;
}

const DetailsView: React.FC<DetailsViewProps> = ({
  eventData,
  ticketInfoData,
}) => {
  const displayEventPhoto = useQuery(
    api.photo.getFileUrl,
    eventData.photo ? { storageId: eventData.photo } : "skip"
  );

  const handleAddressClick = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.address)}`;
    window.open(googleMapsUrl, "_blank");
  };

  const isSalesOpen = isTicketSalesOpen(ticketInfoData);

  return (
    <div className="flex flex-col rounded border border-altGray w-[400px] p-3 shadow bg-white">
      {displayEventPhoto === undefined && <EventFormSkeleton />}
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
        <Image
          src={displayEventPhoto}
          alt={eventData.name || "Event photo"}
          className="w-full h-[180px] md:h-[217px] mb-1.5 md:mb-2 rounded-lg object-cover"
          width={400}
          height={400}
        />
      )}
      <div>
        <IconTextRow
          icon={<MdOutlineCalendarToday />}
          text={
            eventData.startTime ? formatDateMDY(eventData.startTime) : "TBD"
          }
        />
        <IconTextRow
          icon={<FiClock />}
          text={`${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}`}
        />
        <AddressTextRow
          icon={<LuMapPin />}
          text={eventData.address}
          isLastItem={true}
          onClick={handleAddressClick}
        />
      </div>
    </div>
  );
};

export default DetailsView;
