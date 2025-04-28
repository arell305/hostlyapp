import React from "react";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import TicketCard from "../cards/TicketCard";
import CustomCard from "@/components/shared/cards/CustomCard";
import EmptyList from "@/components/shared/EmptyList";

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
  if (tickets.length === 0) {
    return <EmptyList items={tickets} />;
  }
  return (
    <CustomCard>
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket._id}
          ticket={ticket}
          canCheckInTickets={canCheckInTickets}
          setSelectedTicketId={setSelectedTicketId}
          setShowRedeemTicket={setShowRedeemTicket}
        />
      ))}
    </CustomCard>
  );
};

export default TicketList;
