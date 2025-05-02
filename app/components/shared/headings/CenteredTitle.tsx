"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CenteredTitleProps {
  title: string;
  className?: string;
}

const CenteredTitle: React.FC<CenteredTitleProps> = ({ title, className }) => {
  return (
    <p
      className={cn(
        "absolute left-1/2 transform -translate-x-1/2 text-lg font-bold text-center",
        className
      )}
    >
      {title}
    </p>
  );
};

export default CenteredTitle;
