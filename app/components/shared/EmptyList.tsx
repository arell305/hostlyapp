"use client";

interface EmptyListProps {
  items?: unknown[];
  message?: string;
}

const EmptyList: React.FC<EmptyListProps> = ({
  items,
  message = "No results found",
}) => {
  if (items && items.length > 0) return null;

  return <div className="text-grayText ">{message}</div>;
};

export default EmptyList;
