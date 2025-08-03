import CustomCard from "@/components/shared/cards/CustomCard";
import { TicketSalesGroup } from "@/types/convex-types";

interface PromoterTicketDataProps {
  promoterTicketData: TicketSalesGroup;
}

const PromoterTicketData: React.FC<PromoterTicketDataProps> = ({
  promoterTicketData,
}) => {
  if (!promoterTicketData) return null;

  const { promoterName, sales } = promoterTicketData;

  return (
    <CustomCard className="p-4 space-y-4 w-full">
      <h2 className="font-medium">{promoterName}</h2>
      {sales.map(({ name, count }) => (
        <div key={name} className="flex justify-between items-center">
          <span className="text-grayText">{name} Tickets Sold</span>
          <p>{count}</p>
        </div>
      ))}
    </CustomCard>
  );
};

export default PromoterTicketData;
