import { ReactNode } from "react";

interface AddressTextRowProps {
  icon: ReactNode;
  text: string;
  isLastItem?: boolean;
  onClick?: () => void;
}

const AddressTextRow: React.FC<AddressTextRowProps> = ({
  icon,
  text,
  isLastItem = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex space-x-3 py-3 px-3 ${!isLastItem ? "border-b" : ""} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="text-2xl md:text-base flex-shrink-0 mt-1">{icon}</div>
      <p className="flex-1 font-medium break-words underline">{text}</p>
    </div>
  );
};

export default AddressTextRow;
