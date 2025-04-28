"use client";

import { ReactNode } from "react";

interface EmptyListProps {
  items: unknown[]; // array of anything
  message?: string; // optional custom message
}

const EmptyList: React.FC<EmptyListProps> = ({
  items,
  message = "No results found",
}) => {
  if (items.length > 0) return null;

  return <div className="text-grayText pl-4">{message}</div>;
};

export default EmptyList;
