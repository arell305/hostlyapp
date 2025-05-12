import { formatCurrency } from "../../../../../utils/helpers";
import {
  formatToTimeAndShortDate,
  isAfterNowInPacificTime,
} from "../../../../../utils/luxon";
import { TicketInfoSchema } from "@/types/schemas-types";
import CustomCard from "@/components/shared/cards/CustomCard";
interface TicketViewProps {
  ticketData: TicketInfoSchema;
}

const TicketView: React.FC<TicketViewProps> = ({ ticketData }) => {
  const isTicketsSalesOpen = isAfterNowInPacificTime(
    ticketData.ticketSalesEndTime
  );
  return (
    <CustomCard className="flex flex-col    w-[95%] py-3 px-7 mx-auto">
      <h2 className="text-2xl font-bold  mb-1">Tickets</h2>
      <p>
        Ticket sales {isTicketsSalesOpen ? "closes" : "closed"} on{" "}
        {formatToTimeAndShortDate(ticketData.ticketSalesEndTime)}
      </p>
      <div className="flex mt-2 justify-between py-2">
        <div>
          <h3 className="font-semibold ">Male Tickets</h3>
          <p className="text-sm ">
            {formatCurrency(ticketData.ticketTypes.male.price)}
          </p>
        </div>
      </div>
      <div className="flex justify-between py-2">
        <div>
          <h3 className="font-semibold ">Female Tickets</h3>
          <p className="text-sm ">
            {formatCurrency(ticketData.ticketTypes.female.price)}
          </p>
        </div>
      </div>
    </CustomCard>
  );
};

export default TicketView;
