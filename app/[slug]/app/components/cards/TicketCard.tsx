import { FaCheckCircle } from "react-icons/fa";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import { Badge } from "@/components/ui/badge";
import { formatArrivalTime } from "../../../../../utils/luxon";

interface TicketCardProps {
  ticket: TicketSchemaWithPromoter;
  canCheckInTickets: boolean;
  setSelectedTicketId?: (id: string) => void;
  setShowRedeemTicket?: (show: boolean) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  canCheckInTickets,
  setShowRedeemTicket,
  setSelectedTicketId,
}) => {
  const handleClick = () => {
    if (
      canCheckInTickets &&
      !ticket.checkInTime &&
      setSelectedTicketId &&
      setShowRedeemTicket
    ) {
      setSelectedTicketId(ticket.ticketUniqueId);
      setShowRedeemTicket(true);
    }
  };

  return (
    <div
      className={`border-b p-4 w-full flex justify-between items-center ${
        canCheckInTickets ? "hover:bg-cardBackgroundHover cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="font-semibold truncate">{ticket.ticketUniqueId}</p>
          <p className="text-sm text-grayText font-medium">
            {ticket.ticketTypeName}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-grayText text-sm truncate">{ticket.email}</p>
          {ticket.promoterName && (
            <Badge className="ml-2 text-xs text-grayText whitespace-nowrap">
              Promoter: {ticket.promoterName}
            </Badge>
          )}
        </div>
      </div>

      {ticket.checkInTime && (
        <div className="flex items-center justify-center flex-col w-[50px] ml-2">
          <FaCheckCircle className="text-primaryBlue" size={28} />
          <p className="text-xs text-grayText text-center">
            {formatArrivalTime(ticket.checkInTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
