"use client";

import { MdOutlineCalendarToday } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { formatTime, formatDateMDY } from "@shared/utils/luxon";
import CustomCard from "@shared/ui/cards/CustomCard";
import EventImagePreview from "./EventImagePreview";
import EventTitle from "./EventTitle";
import IconTextRow from "@/shared/ui/display/IconTextRow";
import AddressTextRow from "@/shared/ui/display/AddressTextRow";
import { cn } from "@/shared/lib/utils";
import { Doc } from "convex/_generated/dataModel";

interface DetailsViewProps {
  eventData: Doc<"events">;
  className?: string;
}

const DetailsView: React.FC<DetailsViewProps> = ({ eventData, className }) => {
  const handleAddressClick = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      eventData.address
    )}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row gap-x-10 w-[95%] max-w-5xl mx-auto mt-4",
        className
      )}
    >
      <div className="w-full md:w-2/5">
        <EventImagePreview storageId={eventData.photo} />
      </div>

      <div className="w-full md:w-3/5 flex flex-col ">
        <EventTitle title={eventData.name} />
        <CustomCard className="mt-4">
          <IconTextRow
            icon={<MdOutlineCalendarToday />}
            text={
              eventData.startTime ? formatDateMDY(eventData.startTime) : "TBD"
            }
          />
          <IconTextRow
            icon={<FiClock />}
            text={`${formatTime(eventData.startTime)} - ${formatTime(
              eventData.endTime
            )}`}
          />
          <AddressTextRow
            icon={<LuMapPin />}
            text={eventData.address}
            isLastItem={true}
            onClick={handleAddressClick}
          />
        </CustomCard>
      </div>
    </div>
  );
};

export default DetailsView;
