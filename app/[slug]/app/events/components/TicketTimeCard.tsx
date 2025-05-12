import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import { FiClock } from "react-icons/fi";
import { formatToTimeAndShortDate, isPast } from "../../../../../utils/luxon";
import { TicketInfoSchema } from "@/types/schemas-types";
import { TicketTotals } from "@/types/convex-types";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";
interface TicketTimeCardProps {
  className?: string;
  ticketInfo: TicketInfoSchema;
  ticketTotals: TicketTotals | null;
  canEditEvent: boolean;
}

const TicketTimeCard = ({
  className,
  ticketInfo,
  ticketTotals,
  canEditEvent,
}: TicketTimeCardProps) => {
  const isTicketsSalesOpen = !isPast(ticketInfo.ticketSalesEndTime);

  return (
    <CustomCard className={className}>
      <StaticField
        label={
          isTicketsSalesOpen ? "Tickets Sales Ends:" : "Tickets Sales Ended:"
        }
        value={formatToTimeAndShortDate(ticketInfo.ticketSalesEndTime)}
        icon={<FiClock className="text-xl text-grayText" />}
        badge={
          isTicketsSalesOpen ? (
            <Badge variant="success">Open</Badge>
          ) : (
            <Badge variant="destructive">Closed</Badge>
          )
        }
      />
      <StaticField
        label="Male Tickets Sold:"
        value={
          ticketTotals
            ? `${ticketTotals.maleCount}${
                canEditEvent ? ` / ${ticketInfo.ticketTypes.male.capacity}` : ""
              }`
            : "-"
        }
        icon={<Ticket className="text-xl text-grayText" />}
      />
      <StaticField
        label="Female Tickets Sold:"
        value={
          ticketTotals
            ? `${ticketTotals.femaleCount}${
                canEditEvent
                  ? ` / ${ticketInfo.ticketTypes.female.capacity}`
                  : ""
              }`
            : "-"
        }
        icon={<Ticket className="text-xl text-grayText" />}
      />
    </CustomCard>
  );
};

export default TicketTimeCard;
