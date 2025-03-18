import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Promoter } from "@/types/types";
import { TbCircleLetterF, TbCircleLetterM } from "react-icons/tb";
import { Id } from "../../../../../convex/_generated/dataModel";

interface PromoterTicketSalesProps {
  setSelectedPromoterId: (id: "all" | Id<"users">) => void;
  promoters: Promoter[];
  maleTicketsWithPromoter: number;
  femaleTicketsWithPromoter: number;
}

const PromoterTicketSales: React.FC<PromoterTicketSalesProps> = ({
  setSelectedPromoterId,
  promoters,
  maleTicketsWithPromoter,
  femaleTicketsWithPromoter,
}) => {
  return (
    <div className="bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
      <h2 className="text-2xl font-bold pt-2 pb-4">Promoter Ticket Sales</h2>
      <Select onValueChange={setSelectedPromoterId} defaultValue="all">
        <SelectTrigger className="mb-2">
          <SelectValue placeholder="Select Promoter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Promoters</SelectItem>
          {promoters.map((promoter) => (
            <SelectItem key={promoter.promoterUserId} value={promoter.name}>
              {promoter.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div>
        <div className="flex items-center space-x-3 py-3 border-b">
          <TbCircleLetterM className="text-2xl" />
          <p>
            Male Tickets Sold:{" "}
            <span className="text-gray-700 font-semibold">
              {maleTicketsWithPromoter}{" "}
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3 py-3">
          <TbCircleLetterF className="text-2xl" />
          <p>
            Female Tickets Sold:{" "}
            <span className="text-gray-700 font-semibold">
              {femaleTicketsWithPromoter}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoterTicketSales;
