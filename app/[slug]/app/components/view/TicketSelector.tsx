import CountInputField from "@/components/shared/fields/CountInputField";
import { formatCurrency } from "../../../../../utils/helpers";
import { EventTicketTypesSchema } from "@/types/schemas-types";
import { isAfterNowInPacificTime } from "@/utils/luxon";

interface TicketSelectorProps {
  ticketType: EventTicketTypesSchema;
  count: number;
  soldCount: number;
  setCount: (count: number) => void;
}

const TicketSelector: React.FC<TicketSelectorProps> = ({
  ticketType,
  count,
  soldCount,
  setCount,
}) => {
  const { name, price, capacity, ticketSalesEndTime } = ticketType;
  const remaining = capacity - soldCount;
  const isSoldOut = remaining <= 0;
  const isTicketSalesEnded = !isAfterNowInPacificTime(ticketSalesEndTime);

  return (
    <div className="flex justify-between items-center py-3 px-4 border-b">
      <div>
        <h3 className="font-semibold text-base">{name} Ticket</h3>
        <p className="text-sm text-grayText">
          {isTicketSalesEnded ? (
            <span className="text-red-500 font-medium">Ticket sales ended</span>
          ) : isSoldOut ? (
            <span className="text-red-500 font-medium">Sold Out</span>
          ) : (
            `${formatCurrency(price)}`
          )}
        </p>
      </div>

      {!isTicketSalesEnded && !isSoldOut && (
        <CountInputField
          label=""
          value={count}
          onChange={(newVal) => setCount(Math.min(newVal, remaining))}
        />
      )}
    </div>
  );
};

export default TicketSelector;
