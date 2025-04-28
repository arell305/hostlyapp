import { FaCheckCircle } from "react-icons/fa";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import { Gender } from "@/types/enums";
import { TbCircleLetterF, TbCircleLetterM } from "react-icons/tb";
import { Badge } from "@/components/ui/badge";
import {
  formatArrivalTime,
  formatUnixToTimeAndAbbreviatedDate,
} from "../../../../../utils/luxon";
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
      className={`border-b  p-4 w-full flex justify-between items-center ${
        canCheckInTickets ? "hover:bg-cardBackgroundHover cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex flex-col">
        <div className="flex items-center">
          {ticket.gender === Gender.Male ? (
            <TbCircleLetterM className="text-2xl pr-1" />
          ) : (
            <TbCircleLetterF className="text-2xl pr-1" />
          )}
          <p className="font-semibold">{ticket.ticketUniqueId}</p>
          {ticket.promoterName && (
            <Badge className="ml-2 text-xs text-grayText">{`Promoter: ${ticket.promoterName}`}</Badge>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex">
            <p className="text-grayText text-xs">
              {formatUnixToTimeAndAbbreviatedDate(ticket._creationTime)}
            </p>
          </div>
          <p className="text-grayText text-xs">{ticket.email}</p>
        </div>
      </div>
      {ticket.checkInTime && (
        <div className="flex items-center justify-center flex-col w-[40px]">
          <FaCheckCircle className=" text-primaryBlue text-center" size={33} />
          <p className="text-[10px] text-grayText">
            {" "}
            {formatArrivalTime(ticket.checkInTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
