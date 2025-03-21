import { ReactNode } from "react";

interface IconTextRowProps {
  icon: ReactNode;
  text: string;
  isLastItem?: boolean;
}

const IconTextRow: React.FC<IconTextRowProps> = ({
  icon,
  text,
  isLastItem = false,
}) => {
  return (
    <div
      className={`flex items-center space-x-3 py-3 px-3 ${!isLastItem ? "border-b" : ""}`}
    >
      <div className="text-2xl md:text-base flex-shrink-0">{icon}</div>
      <p className="flex-1 font-medium truncate">{text}</p>
    </div>
  );
};

export default IconTextRow;
