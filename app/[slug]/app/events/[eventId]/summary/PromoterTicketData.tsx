import CustomCard from "@/components/shared/cards/CustomCard";
import { TicketSalesGroup } from "@/types/convex-types";
import EmptyStateCard from "../../components/EmptyStateCard";
import { BarChart } from "lucide-react";

interface PromoterTicketDataProps {
  promoterTicketData: TicketSalesGroup;
}

const PromoterTicketData: React.FC<PromoterTicketDataProps> = ({
  promoterTicketData,
}) => {
  if (!promoterTicketData) return null;

  const { maleCount, femaleCount, promoterName } = promoterTicketData;
  return (
    <CustomCard className="p-4 space-y-4 w-full ">
      <h3 className="text-lg font-bold">{promoterName}</h3>
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
