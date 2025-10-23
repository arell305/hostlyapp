import { TicketSchemaWithPromoter } from "@/shared/types/schemas-types";
import TicketCard from "@/features/tickets/components/TicketCard";
import CustomCard from "@shared/ui/cards/CustomCard";
import EmptyList from "@/shared/ui/list/EmptyList";

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
