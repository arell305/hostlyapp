import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import { FiClock } from "react-icons/fi";
import { formatToTimeAndShortDate, isPast } from "../../../../../utils/luxon";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "lucide-react";
import { EventTicketTypesSchema } from "@/types/schemas-types";
import { TicketTypeTotal } from "@/types/convex-types";

interface TicketTimeCardProps {
  className?: string;
  ticketInfo: EventTicketTypesSchema[];
  ticketTotals: TicketTypeTotal[] | null;
  canEditEvent: boolean;
}

const TicketTimeCard = ({
  className,
  ticketInfo,
  ticketTotals,
  canEditEvent,
}: TicketTimeCardProps) => {
  return (
    <div className={className}>
      {ticketInfo.map((ticket) => {
        const isTicketsSalesOpen =
          typeof ticket.ticketSalesEndTime === "number" &&
          !isPast(ticket.ticketSalesEndTime);

        const count =
          ticketTotals?.find((t) => t.eventTicketTypeId === ticket._id)
            ?.count ?? 0;

        return (
          <CustomCard key={ticket._id} className="mb-4">
            <StaticField
              label={`${ticket.name} – ${
                isTicketsSalesOpen
                  ? "Tickets Sales Ends:"
                  : "Tickets Sales Ended:"
              }`}
              value={
                typeof ticket.ticketSalesEndTime === "number"
                  ? formatToTimeAndShortDate(ticket.ticketSalesEndTime)
                  : "N/A"
              }
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
              className="border-none"
              label="Tickets Sold:"
              value={
                canEditEvent ? `${count} / ${ticket.capacity}` : `${count}`
              }
              icon={<Ticket className="text-xl text-grayText" />}
            />
          </CustomCard>
        );
      })}
    </div>
  );
};

export default TicketTimeCard;
