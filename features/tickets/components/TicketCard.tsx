"use client";

import { FaCheckCircle } from "react-icons/fa";
import { TicketSchemaWithPromoter } from "@/shared/types/schemas-types";
import { Badge } from "@/shared/ui/primitive/badge";
import { formatArrivalTime } from "@/shared/utils/luxon";

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
        </div>

        <div className="flex  items-center">
          <p className="text-grayText text-sm truncate">
            {" "}
            {ticket.ticketTypeName}
          </p>
          {ticket.promoterName && (
            <Badge className="flex pt-[2px] space-x-1 ml-2">
              Promoter: {ticket.promoterName}
            </Badge>
          )}
        </div>
      </div>

      {ticket.checkInTime && (
        <div className="flex items-center justify-center flex-col gap-y-1 w-[40px]">
          <FaCheckCircle className=" text-primaryBlue text-center" size={33} />
          <p className="text-xs text-grayText">
            {formatArrivalTime(ticket.checkInTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
