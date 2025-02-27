import { TicketInfo } from "@/types/types";
import {
  formatCurrency,
  isAfterNowInPacificTime,
} from "../../../../../utils/helpers";
import { formatToTimeAndShortDate } from "../../../../../utils/luxon";
import { TicketInfoSchema } from "@/types/schemas-types";

interface TicketViewProps {
  ticketData: TicketInfoSchema;
}

const TicketView: React.FC<TicketViewProps> = ({ ticketData }) => {
  const isTicketsSalesOpen = isAfterNowInPacificTime(
    ticketData.ticketSalesEndTime
  );
  return (
    <div className="flex flex-col bg-white rounded border border-altGray w-[400px] p-3 shadow">
      <h2 className="text-2xl font-bold mb-2 text-center md:text-start">
        Tickets
      </h2>
      <p>
        Ticket sales {isTicketsSalesOpen ? "closes" : "closed"} on{" "}
        {formatToTimeAndShortDate(ticketData.ticketSalesEndTime)}
      </p>
      <div className="flex justify-between border-b border-altGray py-2">
        <div>
          <h3 className="font-semibold font-raleway">Male Tickets</h3>
          <p className="text-sm text-altBlack">
            {formatCurrency(ticketData.ticketTypes.male.price)}
          </p>
        </div>
      </div>
      <div className="flex justify-between border-b border-altGray py-2">
        <div>
          <h3 className="font-semibold font-raleway">Female Tickets</h3>
          <p className="text-sm text-altBlack">
            {formatCurrency(ticketData.ticketTypes.female.price)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
