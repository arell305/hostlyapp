import { PromoterTicketSalesByType } from "@/types/convex-types";
import React from "react";

interface PromoterTicketsContentProps {
  ticketCounts: PromoterTicketSalesByType[];
}

const PromoterTicketsContent = ({
  ticketCounts,
}: PromoterTicketsContentProps) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Your Ticket Sales</h3>
      <div className="space-y-2">
        {ticketCounts.map((ticket) => (
          <div key={ticket.name} className="flex justify-between items-center">
            <span className="text-base">{ticket.name}</span>
            <span className="font-semibold">{ticket.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoterTicketsContent;
