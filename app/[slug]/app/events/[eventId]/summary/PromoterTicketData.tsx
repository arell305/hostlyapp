import CustomCard from "@/components/shared/cards/CustomCard";
import { TicketCounts } from "@/types/types";

interface PromoterTicketDataProps {
  promoterTicketData: TicketCounts;
}

const PromoterTicketData: React.FC<PromoterTicketDataProps> = ({
  promoterTicketData,
}) => {
  const { male, female } = promoterTicketData;
  return (
    <CustomCard className="p-4 space-y-4 w-full max-w-md">
      <div className="flex justify-between items-center">
        <span className="text-grayText">Males Tickets Sold</span>
        <p>{male}</p>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-grayText">Females Tickets Sold</span>
        <p>{female}</p>
      </div>
    </CustomCard>
  );
};

export default PromoterTicketData;
