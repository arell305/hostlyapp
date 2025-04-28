"use client";

import { RiArrowDownWideLine, RiArrowUpWideLine } from "react-icons/ri";

interface ToggleCalendarProps {
  isWeekView: boolean;
  onToggle: () => void;
}

const ToggleCalendar: React.FC<ToggleCalendarProps> = ({
  isWeekView,
  onToggle,
}) => {
  return (
    <div className="flex justify-center">
      <button
        onClick={onToggle}
        className="mt-0.5 text-grayText hover:text-whiteText transition hover:bg-cardBackgroundHover rounded"
      >
        {isWeekView ? (
          <RiArrowDownWideLine className="text-3xl" />
        ) : (
          <RiArrowUpWideLine className="text-3xl" />
        )}
      </button>
    </div>
  );
};

export default ToggleCalendar;
