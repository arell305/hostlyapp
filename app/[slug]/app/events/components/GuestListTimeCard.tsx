"use client";

import { FiClock } from "react-icons/fi";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import { Badge } from "@/components/ui/badge";

interface GuestListTimeCardProps {
  isCheckInOpen: boolean;
  guestListCloseTime: string;
  formattedCheckInEndTime: string;
  className?: string;
  isGuestListOpen: boolean;
}

const GuestListTimeCard: React.FC<GuestListTimeCardProps> = ({
  isCheckInOpen,
  guestListCloseTime,
  formattedCheckInEndTime,
  className,
  isGuestListOpen,
}) => {
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
    </CustomCard>
  );
};

export default GuestListTimeCard;
