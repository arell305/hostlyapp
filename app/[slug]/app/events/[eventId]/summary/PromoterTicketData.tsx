import CustomCard from "@/components/shared/cards/CustomCard";
import { TicketSalesGroup } from "@/types/convex-types";

interface PromoterTicketDataProps {
  promoterTicketData: TicketSalesGroup;
}

const PromoterTicketData: React.FC<PromoterTicketDataProps> = ({
  promoterTicketData,
}) => {
  const { maleCount, femaleCount, promoterName } = promoterTicketData;
  return (
    <CustomCard className="p-4 space-y-4 w-full max-w-md">
      <h2 className="text-lg font-bold">{promoterName}</h2>
      <div className="flex justify-between items-center">
        <span className="text-grayText">Males Tickets Sold</span>
        <p>{maleCount}</p>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-grayText">Females Tickets Sold</span>
        <p>{femaleCount}</p>
      </div>
    </CustomCard>
  );
};

export default PromoterTicketData;
