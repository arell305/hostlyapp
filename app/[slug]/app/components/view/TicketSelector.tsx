import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
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
    <div className="flex justify-between border-b border-altGray py-2">
      <div>
        <h3 className="font-semibold font-raleway">{label} Tickets</h3>
        {isSoldOut ? (
          <p className="text-sm font-medium text-red-500 mt-1">Sold Out</p>
        ) : (
          <>
            <p className="text-sm text-altBlack">{formatCurrency(price)}</p>
          </>
        )}
      </div>

      {!isSoldOut && (
        <div className="flex items-center gap-2">
          <CiCircleMinus
            className="text-3xl hover:cursor-pointer"
            onClick={() => setCount(Math.max(0, count - 1))}
          />
          <p className="text-xl w-8 text-center">{count}</p>
          <CiCirclePlus
            className="text-3xl hover:cursor-pointer"
            onClick={() => setCount(count + 1)}
          />
        </div>
      )}
    </div>
  );
};

export default TicketSelector;
