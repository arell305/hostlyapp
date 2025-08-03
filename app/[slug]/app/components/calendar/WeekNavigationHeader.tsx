"use client";

import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";

interface WeekNavigationHeaderProps {
  onNavigate: (direction: "prev" | "next") => void;
  startDate: string;
  endDate: string;
}

const WeekNavigationHeader: React.FC<WeekNavigationHeaderProps> = ({
  onNavigate,
  startDate,
  endDate,
}) => {
  return (
    <div className="flex items-center justify-between w-full mb-4 h-[44px]">
      <button
        onClick={() => onNavigate("prev")}
        className="px-3 py-2 hover:bg-cardBackgroundHover rounded"
      >
        <RiArrowDropLeftLine className="text-2xl" />
      </button>
      <h3 className="text-xl font-semibold leading-[18px] font-sans">
        {startDate} - {endDate}
      </h3>
      <button
        onClick={() => onNavigate("next")}
        className="px-3 py-2 hover:bg-cardBackgroundHover rounded"
      >
        <RiArrowDropRightLine className="text-2xl" />
      </button>
    </div>
  );
};

export default WeekNavigationHeader;
