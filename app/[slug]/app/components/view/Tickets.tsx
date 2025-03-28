import { formatCurrency } from "../../../../../utils/helpers";
import {
  formatToTimeAndShortDate,
  isAfterNowInPacificTime,
} from "../../../../../utils/luxon";
import { TicketInfoSchema } from "@/types/schemas-types";

interface TicketViewProps {
  ticketData: TicketInfoSchema;
}

const TicketView: React.FC<TicketViewProps> = ({ ticketData }) => {
  const isTicketsSalesOpen = isAfterNowInPacificTime(
    ticketData.ticketSalesEndTime
  );
  return (
    <div className="flex flex-col bg-white rounded border border-altGray w-[95%] py-3 px-7 shadow">
      <h2 className="text-2xl font-bold  mb-1">Tickets</h2>
      <p>
        Ticket sales {isTicketsSalesOpen ? "closes" : "closed"} on{" "}
        {formatToTimeAndShortDate(ticketData.ticketSalesEndTime)}
      </p>
      <div className="flex mt-2 justify-between border-b border-altGray py-2">
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
