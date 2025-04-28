import StaticField from "@/components/shared/fields/StaticField";
import { TbCircleLetterM, TbCircleLetterF } from "react-icons/tb";

interface TicketCountProps {
  maleTicketsWithPromoter: number;
  femaleTicketsWithPromoter: number;
}

const TicketCount: React.FC<TicketCountProps> = ({
  maleTicketsWithPromoter,
  femaleTicketsWithPromoter,
}) => {
  return (
    <div className="px-2">
      <StaticField
        label="Male Tickets Sold"
        value={maleTicketsWithPromoter}
        icon={<TbCircleLetterM className="text-2xl" />}
      />
      <StaticField
        label="Female Tickets Sold"
        value={femaleTicketsWithPromoter}
        icon={<TbCircleLetterF className="text-2xl" />}
        className="border-b-0" // Remove bottom border if needed
      />
    </div>
  );
};

export default TicketCount;
