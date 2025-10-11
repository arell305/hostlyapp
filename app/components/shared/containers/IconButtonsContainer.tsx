"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface NavButtonsContainerProps {
  children: React.ReactNode;
  className?: string;
}

const NavButtonsContainer: React.FC<NavButtonsContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
};

export default NavButtonsContainer;
