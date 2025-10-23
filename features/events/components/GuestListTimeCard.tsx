"use client";

import { FiClock, FiLink } from "react-icons/fi";
import CustomCard from "@shared/ui/cards/CustomCard";
import StaticField from "@shared/ui/fields/StaticField";
import { Badge } from "@shared/ui/primitive/badge";
import { usePathname } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import { LuClipboardList } from "react-icons/lu";

interface GuestListTimeCardProps {
  isCheckInOpen: boolean;
  guestListCloseTime: string;
  formattedCheckInEndTime: string;
  className?: string;
  isGuestListOpen: boolean;
  eventId: Id<"events">;
  guestListRules: string;
}

const GuestListTimeCard: React.FC<GuestListTimeCardProps> = ({
  isCheckInOpen,
  guestListCloseTime,
  formattedCheckInEndTime,
  className,
  isGuestListOpen,
  eventId,
  guestListRules,
}) => {
  const pathname = usePathname();
  const slug = pathname.split("/")[1]; // Extract "vest" from "/vest/app/events/..."

  const guestListUrl = `${window.location.origin}/${slug}/events/${eventId}/guestlist`;
  return (
    <CustomCard className={className}>
      <StaticField
        label={isGuestListOpen ? "RSVPS Closes:" : "RSVPS Closed:"}
        value={guestListCloseTime}
        icon={<FiClock className="text-xl text-grayText" />}
        badge={
          isGuestListOpen ? (
            <Badge variant="success">Open</Badge>
          ) : (
            <Badge variant="destructive">Closed</Badge>
          )
        }
      />
      <StaticField
        label={isCheckInOpen ? "Check In Ends:" : "Check In Ended:"}
        value={formattedCheckInEndTime}
        icon={<FiClock className="text-xl text-grayText" />}
        badge={
          isCheckInOpen ? (
            <Badge variant="success">Open</Badge>
          ) : (
            <Badge variant="destructive">Closed</Badge>
          )
        }
      />
      <StaticField
        label="Company Guest List Link"
        value={guestListUrl}
        link={guestListUrl}
        icon={<FiLink className="text-xl" />}
      />
      <StaticField
        label="Guest List Rules"
        value={guestListRules}
        icon={<LuClipboardList className="text-xl" />}
      />
    </CustomCard>
  );
};

export default GuestListTimeCard;
