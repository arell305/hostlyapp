import React from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { LuMapPin } from "react-icons/lu";
import { formatTime, formatDateMDY } from "../../../../../utils/luxon";
import { EventSchema } from "@/types/schemas-types";
import CustomCard from "@/components/shared/cards/CustomCard";
import EventImagePreview from "./EventImagePreview";
import EventTitle from "./EventTitle";
import IconTextRow from "../../components/ui/IconTextRow";
import AddressTextRow from "../../components/ui/AddressTextRow";

interface DetailsViewProps {
  eventData: EventSchema;
}

const DetailsView: React.FC<DetailsViewProps> = ({ eventData }) => {
  const handleAddressClick = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventData.address)}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="flex flex-col md:flex-row gap-x-10 w-[95%] max-w-5xl mx-auto">
      {/* Image Column */}
      <div className="w-full md:w-2/5">
        <EventImagePreview storageId={eventData.photo} />
      </div>

      {/* Info Column */}
      <div className="w-full md:w-3/5 flex flex-col justify-between">
        <EventTitle title={eventData.name} />
        <CustomCard className="mt-4 md:mt-0">
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
