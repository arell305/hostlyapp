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
        className=" text-grayText hover:text-whiteText transition "
      >
        {isWeekView ? (
          <p className="text-sm underline">Expand</p>
        ) : (
          <p className="text-sm underline">Collapse</p>
        )}
      </button>
    </div>
  );
};

export default ToggleCalendar;
