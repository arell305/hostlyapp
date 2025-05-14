"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StaticPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const StaticPageContainer: React.FC<StaticPageContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex justify-center items-center bg-backgroundBlack min-h-[100dvh] md:min-h-screen overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
};

export default StaticPageContainer;
