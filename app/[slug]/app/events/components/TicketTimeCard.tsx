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

interface TicketTimeCardProps {
  className?: string;
  ticketData: TicketInfoSchema;
  tickets: TicketSchemaWithPromoter[];
}

const TicketTimeCard = ({
  className,
  ticketData,
  tickets,
}: TicketTimeCardProps) => {
  const isTicketsSalesOpen = !isPast(ticketData.ticketSalesEndTime);

  const { maleTickets, femaleTickets } = useMemo(() => {
    return countTicketsByGender(tickets);
  }, [tickets]);

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
        value={formatToTimeAndShortDate(ticketData.ticketSalesEndTime)}
        icon={<FiClock className="text-xl text-grayText" />}
      />
      <StaticField
        label="Male Tickets Sold:"
        value={`${maleTickets} / ${ticketData.ticketTypes.male.capacity}`}
        icon={<FiClock className="text-xl text-grayText" />}
      />
      <StaticField
        label="Female Tickets Sold:"
        value={`${femaleTickets} / ${ticketData.ticketTypes.female.capacity}`}
        icon={<FiClock className="text-xl text-grayText" />}
      />
    </CustomCard>
  );
};

export default TicketTimeCard;
