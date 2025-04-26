import React from "react";
import { cn } from "@/lib/utils";

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "rounded-md border  bg-cardBackground flex flex-col ",
        className
      )}
    >
      {children}
    </div>
  );
};

export default CustomCard;
