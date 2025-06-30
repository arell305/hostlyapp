"use client";

import TicketSelector from "@/[slug]/app/components/view/TicketSelector";
import { EventTicketTypesSchema } from "@/types/schemas-types";
import { useEventCheckout } from "@/contexts/EventCheckoutContext";
import React from "react";
import { TicketSoldCountByType } from "@/types/types";

interface TicketSelectorListProps {
  ticketTypes: EventTicketTypesSchema[];
  ticketSoldCounts?: TicketSoldCountByType[] | null;
}

const TicketSelectorList: React.FC<TicketSelectorListProps> = ({
  ticketTypes,
  ticketSoldCounts,
}) => {
  const { ticketCounts, setCountForTicket } = useEventCheckout();

  return (
    <div className="py-3 px-7 pb-10">
      <h2 className="text-2xl font-bold mb-2 text-start">Tickets</h2>
      {ticketTypes.map((type) => {
        const count = ticketCounts[type._id] || 0;
        const soldCount =
          ticketSoldCounts?.find((t) => t.eventTicketTypeId === type._id)
            ?.count || 0;

        return (
          <TicketSelector
            key={type._id}
            ticketType={type}
            count={count}
            soldCount={soldCount}
            setCount={(val) => setCountForTicket(type._id, val)}
          />
        );
      })}
    </div>
  );
};

export default TicketSelectorList;
