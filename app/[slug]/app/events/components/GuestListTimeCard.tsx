"use client";

import { FiClock } from "react-icons/fi";
import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import SectionTitleWithStatus from "@/components/shared/headings/SectionTitleWithStatus";

interface GuestListTimeCardProps {
  isCheckInOpen: boolean;
  guestListClosed: boolean;
  guestListCloseTime: string;
  formattedCheckInEndTime: string;
  className?: string;
}

const GuestListTimeCard: React.FC<GuestListTimeCardProps> = ({
  isCheckInOpen,
  guestListClosed,
  guestListCloseTime,
  formattedCheckInEndTime,
  className,
}) => {
  return (
    <CustomCard className={className}>
      <SectionTitleWithStatus
        title="Guest List"
        statusText={!isCheckInOpen ? "Check In Closed" : undefined}
      />

      <StaticField
        label={guestListClosed ? "RSVPS Closed:" : "RSVPS Closes:"}
        value={guestListCloseTime}
        icon={<FiClock className="text-xl text-grayText" />}
      />
      <StaticField
        label={isCheckInOpen ? "Check In Ends:" : "Check In Ended:"}
        value={formattedCheckInEndTime}
        icon={<FiClock className="text-xl text-grayText" />}
      />
    </CustomCard>
  );
};

export default GuestListTimeCard;
