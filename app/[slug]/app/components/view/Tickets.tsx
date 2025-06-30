import { EventTicketTypesSchema } from "@/types/schemas-types";
import CustomCard from "@/components/shared/cards/CustomCard";
import TicketTypeCard from "../cards/TicketTypeCard";

interface TicketViewProps {
  ticketData: EventTicketTypesSchema[];
}

const TicketView: React.FC<TicketViewProps> = ({ ticketData }) => {
  return (
    <CustomCard className="flex flex-col w-[95%] py-3 px-7 mx-auto">
      <h2 className="text-2xl font-bold mb-1">Tickets</h2>

      <div className="mt-4 space-y-3">
        {ticketData.map((ticket) => (
          <TicketTypeCard
            key={ticket._id}
            name={ticket.name}
            price={ticket.price}
            ticketSalesEndTime={ticket.ticketSalesEndTime}
          />
        ))}
      </div>
    </CustomCard>
  );
};

export default TicketView;
