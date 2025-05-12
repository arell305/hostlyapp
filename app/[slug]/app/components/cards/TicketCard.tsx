import { FaCheckCircle, FaFemale, FaMale } from "react-icons/fa";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import { Gender } from "@/types/enums";
import {
  TbCircleLetterF,
  TbCircleLetterM,
  TbLetterF,
  TbLetterFSmall,
  TbLetterM,
  TbLetterMSmall,
} from "react-icons/tb";
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
        <div className="flex items-center gap-x-2">
          <div className="w-8 h-8 rounded-full border  flex items-center justify-center mr-2">
            {ticket.gender === Gender.Male ? (
              <TbLetterM className="text-lg" />
            ) : (
              <TbLetterF className="text-lg" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center">
              <p className="font-semibold">{ticket.ticketUniqueId}</p>
              {ticket.promoterName && (
                <Badge className="ml-2 text-xs text-grayText">{`Promoter: ${ticket.promoterName}`}</Badge>
              )}
            </div>
            <p className="text-grayText text-xs"> {ticket.email}</p>
          </div>
        </div>
      </div>
      {ticket.checkInTime && (
        <div className="flex items-center justify-center flex-col w-[40px]">
          <FaCheckCircle className=" text-primaryBlue text-center" size={33} />
          <p className="text-xs text-grayText">
            {" "}
            {formatArrivalTime(ticket.checkInTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
