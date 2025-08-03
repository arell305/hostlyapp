"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TopBarContainerProps {
  children: React.ReactNode;
  className?: string;
}

const TopBarContainer: React.FC<TopBarContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-between  px-0 mb-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export default TopBarContainer;
