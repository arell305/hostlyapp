"use client";

import { FiLink } from "react-icons/fi";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import { usePathname } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import { EventSchema } from "@/types/schemas-types";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDateMDY, formatTime } from "@/utils/luxon";

interface EventLinkCardProps {
  event: EventSchema;
}

const EventLinkCard: React.FC<EventLinkCardProps> = ({ event }) => {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];

  const eventListUrl = `${window.location.origin}/${slug}/events/${event._id}`;
  return (
    <>
      <CustomCard>
        <StaticField
          label="Date"
          value={formatDateMDY(event.startTime)}
          icon={<Calendar className="text-xl" />}
        />

        <StaticField
          label="Time"
          value={`${formatTime(event.startTime)} - ${formatTime(event.endTime)}`}
          icon={<Clock className="text-xl" />}
        />

        <StaticField
          label="Location"
          value={event.address}
          icon={<MapPin className="text-xl" />}
        />

        <StaticField
          label="Link"
          value={eventListUrl}
          link={eventListUrl}
          icon={<FiLink className="text-xl" />}
        />
      </CustomCard>
    </>
  );
};

export default EventLinkCard;
