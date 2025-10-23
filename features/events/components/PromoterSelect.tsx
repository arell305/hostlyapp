"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@shared/ui/primitive/select";
import { Id } from "convex/_generated/dataModel";

interface PromoterSelectProps {
  promoters: { promoterUserId: string; name: string }[];
  selectedPromoterId: string;
  setSelectedPromoterId: (id: "all" | Id<"users">) => void;
}

const PromoterSelect: React.FC<PromoterSelectProps> = ({
  promoters,
  selectedPromoterId,
  setSelectedPromoterId,
}) => {
  return (
    <Select
      onValueChange={setSelectedPromoterId}
      defaultValue={selectedPromoterId}
    >
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
  );
};

export default PromoterSelect;
