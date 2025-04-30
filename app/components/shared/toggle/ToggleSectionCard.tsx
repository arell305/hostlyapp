import { PiMinus, PiPlus } from "react-icons/pi";
import React from "react";

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
      className={`max-w-[505px] mt-12 border-b pb-2 mb-6 pt-2 cursor-pointer rounded hover:bg-cardBackgroundHover  ${className}`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-center px-2">
        <h2 className="text-lg">
          {label}
          {subtitle && <span className="text-sm pl-1">{subtitle}</span>}
        </h2>
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
