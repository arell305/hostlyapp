"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderWithActionProps {
  title: string;
  actions: React.ReactNode;
  className?: string;
}

const SectionHeaderWithAction: React.FC<SectionHeaderWithActionProps> = ({
  title,
  actions,
  className,
}) => {
  return (
    <div
      className={cn("flex items-center justify-between w-full mb-4", className)}
    >
      <h1>{title}</h1>
      <div>{actions}</div>
    </div>
  );
};

export default SectionHeaderWithAction;
