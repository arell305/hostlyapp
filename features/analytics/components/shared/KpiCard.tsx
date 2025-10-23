"use client";

import { CalendarDays } from "lucide-react";
import CustomCard from "@/shared/ui/cards/CustomCard";

interface KpiCardProps {
  label: string;
  value: number | string;
  changeText: string;
  icon?: React.ReactNode;
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  changeText,
  icon = <CalendarDays className="w-5 h-5" />,
}) => {
  return (
    <CustomCard className="gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm ">{label}</span>
        <div>{icon}</div>
      </div>
      <div className="text-3xl font-bold ">{value}</div>
      <div className="text-sm text-grayText">{changeText}</div>
    </CustomCard>
  );
};

export default KpiCard;
