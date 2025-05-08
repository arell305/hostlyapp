import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import SectionTitleWithStatus from "@/components/shared/headings/SectionTitleWithStatus";
import React, { useMemo } from "react";
import { FiClock } from "react-icons/fi";
import { formatToTimeAndShortDate, isPast } from "../../../../../utils/luxon";
import {
  TicketInfoSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import { countTicketsByGender } from "../../../../../utils/format";
import { TicketTotals } from "@/types/convex-types";
interface TicketTimeCardProps {
  className?: string;
  ticketInfo: TicketInfoSchema;
  ticketTotals: TicketTotals | null;
}

const TicketTimeCard = ({
  className,
  ticketInfo,
  ticketTotals,
}: TicketTimeCardProps) => {
  const isTicketsSalesOpen = !isPast(ticketInfo.ticketSalesEndTime);

  return (
    <CustomCard className={className}>
      <SectionTitleWithStatus
        title="Ticket Sales"
        statusText={!isTicketsSalesOpen ? "Tickets Sales Ended" : undefined}
      />
      <StaticField
        label={
          isTicketsSalesOpen ? "Tickets Sales Ends:" : "Tickets Sales Ended:"
        }
        value={formatToTimeAndShortDate(ticketInfo.ticketSalesEndTime)}
        icon={<FiClock className="text-xl text-grayText" />}
      />
      <StaticField
        label="Male Tickets Sold:"
        value={`${ticketTotals?.maleCount} / ${ticketInfo.ticketTypes.male.capacity}`}
        icon={<FiClock className="text-xl text-grayText" />}
      />
      <StaticField
        label="Female Tickets Sold:"
        value={`${ticketTotals?.femaleCount} / ${ticketInfo.ticketTypes.female.capacity}`}
        icon={<FiClock className="text-xl text-grayText" />}
      />
    </CustomCard>
  );
};

export default TicketTimeCard;
