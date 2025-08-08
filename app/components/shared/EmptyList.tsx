"use client";

interface EmptyListProps {
  items?: unknown[];
  message?: string;
  className?: string;
}

const EmptyList: React.FC<EmptyListProps> = ({
  items,
  message = "No results found",
  className = "",
}) => {
  if (items && items.length > 0) return null;

  return <div className={`text-grayText ${className}`}>{message}</div>;
};

export default EmptyList;
