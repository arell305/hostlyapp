import { formatCurrency } from "@/utils/helpers";
import { formatToTimeAndShortDate } from "@/utils/luxon";

interface TicketTypeCardProps {
  name: string;
  price: number;
  ticketSalesEndTime: number;
}

const TicketTypeCard: React.FC<TicketTypeCardProps> = ({
  name,
  price,
  ticketSalesEndTime,
}) => {
  return (
    <div className="flex flex-col border-b border-gray-700 py-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm">{formatCurrency(price)}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Sales close {formatToTimeAndShortDate(ticketSalesEndTime)}
      </p>
    </div>
  );
};

export default TicketTypeCard;
