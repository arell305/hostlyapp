import CountInputField from "@/components/shared/fields/CountInputField";
import { formatCurrency } from "../../../../../utils/helpers";

interface TicketSelectorProps {
  label: string;
  count: number;
  setCount: (count: number) => void;
  price: number;
  capacity: number;
  soldCount: number;
}

const TicketSelector: React.FC<TicketSelectorProps> = ({
  label,
  count,
  setCount,
  price,
  capacity,
  soldCount,
}) => {
  const isSoldOut = soldCount >= capacity;

  return (
    <div className="flex justify-between  py-2 items-center">
      <div>
        <h3 className="font-semibold ">{label} Tickets</h3>
        {isSoldOut ? (
          <p className="text-sm font-medium text-red-500 mt-1">Sold Out</p>
        ) : (
          <p className="text-sm">{formatCurrency(price)}</p>
        )}
      </div>

      {!isSoldOut && (
        <CountInputField
          label=""
          value={count}
          onChange={(newVal) =>
            setCount(Math.min(newVal, capacity - soldCount))
          }
        />
      )}
    </div>
  );
};

export default TicketSelector;
