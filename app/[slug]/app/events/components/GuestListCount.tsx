"use client";

import CustomCard from "@/components/shared/cards/CustomCard";
import StaticField from "@/components/shared/fields/StaticField";
import { TbCircleLetterM, TbCircleLetterF } from "react-icons/tb";

interface GuestListCountProps {
  totalMales: number;
  totalFemales: number;
}

const GuestListCount: React.FC<GuestListCountProps> = ({
  totalMales,
  totalFemales,
}) => {
  return (
    <CustomCard>
      <StaticField
        label="Males Attended"
        value={totalMales}
        icon={<TbCircleLetterM className="text-2xl" />}
      />
      <StaticField
        label="Females Attended"
        value={totalFemales}
        icon={<TbCircleLetterF className="text-2xl" />}
        className="border-b-0" // No bottom border on last item
      />
    </CustomCard>
  );
};

export default GuestListCount;
