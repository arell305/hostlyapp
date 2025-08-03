"use client";

import { FiLink } from "react-icons/fi";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import { usePathname } from "next/navigation";
import { Id } from "convex/_generated/dataModel";

interface EventLinkCardProps {
  eventId: Id<"events">;
}

const EventLinkCard: React.FC<EventLinkCardProps> = ({ eventId }) => {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];

  const eventListUrl = `${window.location.origin}/${slug}/events/${eventId}`;
  return (
    <CustomCard>
      <StaticField
        label="Event Link"
        value={eventListUrl}
        link={eventListUrl}
        icon={<FiLink className="text-xl" />}
      />
    </CustomCard>
  );
};

export default EventLinkCard;
