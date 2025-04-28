"use client";

import CustomCard from "@/components/shared/cards/CustomCard";
import { ReactNode } from "react";

interface EmptyStateCardProps {
  title: string;
  message: string;
  icon: ReactNode;
  className?: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  message,
  icon,
}) => {
  return (
    <CustomCard className="px-4 py-3">
      <h2 className="">{title}</h2>
      <div className="flex items-center space-x-3 py-3">
        {icon}
        <p>{message}</p>
      </div>
    </CustomCard>
  );
};

export default EmptyStateCard;
