"use client";

import React from "react";

interface EventGridProps {
  children: React.ReactNode;
  className?: string;
}

const EventGrid: React.FC<EventGridProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`w-full grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8 md:gap-y-12 justify-items-center ${className}`}
    >
      {children}
    </div>
  );
};

export default EventGrid;
