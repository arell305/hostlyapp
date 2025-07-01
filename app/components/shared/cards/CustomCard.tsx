import React from "react";
import { cn } from "@/lib/utils";

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const CustomCard: React.FC<CustomCardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "rounded-md border bg-cardBackground flex flex-col w-full overflow-hidden",
        className
      )}
      onClick={onClick}
    >
      <div className="p-4">{children}</div> {/* Internal padding only */}
    </div>
  );
};

export default CustomCard;
