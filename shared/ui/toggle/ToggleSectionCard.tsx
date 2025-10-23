import { PiMinus, PiPlus } from "react-icons/pi";

interface ToggleSectionCardProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  subtitle?: string;
  className?: string;
}

const ToggleSectionCard: React.FC<ToggleSectionCardProps> = ({
  label,
  isActive,
  onToggle,
  subtitle,
  className = "",
}) => {
  return (
    <div
      className={`border-b pb-2 mb-6 pt-2 cursor-pointer hover:rounded-md hover:bg-cardBackgroundHover  ${className}`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-center px-2">
        <h3 className="">
          {label}
          {subtitle && <p className="text-sm text-grayText">{subtitle}</p>}
        </h3>
        {isActive ? (
          <PiMinus className="text-2xl" />
        ) : (
          <PiPlus className="text-2xl" />
        )}
      </div>
    </div>
  );
};

export default ToggleSectionCard;
