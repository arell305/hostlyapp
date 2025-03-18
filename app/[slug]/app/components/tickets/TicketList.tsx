import React from "react";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import TicketCard from "../cards/TicketCard";

interface TicketListProps {
  tickets: TicketSchemaWithPromoter[];
  setSelectedTicketId?: (id: string) => void;
  setShowRedeemTicket?: (show: boolean) => void;
  canCheckInTickets: boolean;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  setSelectedTicketId,
  setShowRedeemTicket,
  canCheckInTickets,
}) => {
  return (
    <div className="bg-white">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket._id}
          ticket={ticket}
          canCheckInTickets={canCheckInTickets}
          setSelectedTicketId={setSelectedTicketId}
          setShowRedeemTicket={setShowRedeemTicket}
        />
      ))}
    </div>
  );
};

export default TicketList;
