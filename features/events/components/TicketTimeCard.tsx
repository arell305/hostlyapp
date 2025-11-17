"use client";

import { useMemo } from "react";
import CustomCard from "@shared/ui/cards/CustomCard";
import StaticField from "@shared/ui/fields/StaticField";
import { FiClock } from "react-icons/fi";
import { formatToTimeAndShortDate, isPast } from "../../../shared/utils/luxon";
import { Badge } from "@shared/ui/primitive/badge";
import { Info, Ticket } from "lucide-react";
import { TicketTypeTotal } from "@/shared/types/convex-types";
import { formatCurrency } from "@/shared/utils/helpers";
import { Doc } from "convex/_generated/dataModel";

interface TicketTimeCardProps {
  className?: string;
  ticketInfo: Doc<"eventTicketTypes">[];
  ticketTotals: TicketTypeTotal[] | null;
  canEditEvent: boolean;
  isPromoter: boolean;
}

const TicketTimeCard = ({
  className,
  ticketInfo,
  ticketTotals,
  canEditEvent,
  isPromoter,
}: TicketTimeCardProps) => {
  const sortedTickets = useMemo(
    () =>
      ticketInfo
        .map((t, idx) => ({ t, idx }))
        .sort((a, b) => {
          const aInactive = a.t.isActive === false ? 1 : 0;
          const bInactive = b.t.isActive === false ? 1 : 0;
          if (aInactive !== bInactive) return aInactive - bInactive; // active (0) before inactive (1)
          return a.idx - b.idx; // keep original order among equals
        })
        .map(({ t }) => t),
    [ticketInfo]
  );

  return (
    <div className={`${className} space-y-8`}>
      {sortedTickets.map((ticket) => {
        const isTicketsSalesOpen =
          typeof ticket.ticketSalesEndTime === "number" &&
          !isPast(ticket.ticketSalesEndTime);

        const totalSold =
          ticketTotals?.find((t) => t.eventTicketTypeId === ticket._id)
            ?.count ?? 0;

        const isDeactivated = ticket.isActive === false;

        return (
          <div key={ticket._id}>
            <h2 className="font-medium mb-1 flex items-center gap-2">
              Tickets: {ticket.name}
              {isDeactivated && (
                <Badge variant="destructive">Deactivated</Badge>
              )}
            </h2>

            <CustomCard className={isDeactivated ? "opacity-80" : ""}>
              {ticket.description && (
                <StaticField
                  label="Description:"
                  value={ticket.description}
                  icon={<Info className="text-xl text-grayText" />}
                />
              )}
              <StaticField
                label="Price:"
                value={formatCurrency(ticket.price)}
                icon={<Ticket className="text-xl text-grayText" />}
              />

              <StaticField
                label={isTicketsSalesOpen ? "Sales End:" : "Sales Ended:"}
                value={
                  typeof ticket.ticketSalesEndTime === "number"
                    ? formatToTimeAndShortDate(ticket.ticketSalesEndTime)
                    : "N/A"
                }
                icon={<FiClock className="text-xl text-grayText" />}
                badge={
                  isDeactivated ? undefined : isTicketsSalesOpen ? ( // hide Open/Closed when deactivated
                    <Badge variant="success">Open</Badge>
                  ) : (
                    <Badge variant="secondary">Closed</Badge>
                  )
                }
              />

              {!isPromoter && (
                <StaticField
                  className="border-none"
                  label="Tickets Sold:"
                  value={
                    canEditEvent
                      ? `${new Intl.NumberFormat("en-US").format(totalSold)} / ${new Intl.NumberFormat("en-US").format(ticket.capacity)}`
                      : `${new Intl.NumberFormat("en-US").format(totalSold)}`
                  }
                  icon={<Ticket className="text-xl text-grayText" />}
                />
              )}
            </CustomCard>
          </div>
        );
      })}
    </div>
  );
};

export default TicketTimeCard;
