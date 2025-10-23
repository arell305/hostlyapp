"use client";

import { formatNarrowWeekday } from "@/shared/utils/luxon";

interface WeekdayHeaderProps {
  weekdays: Date[];
}

const WeekdayHeader: React.FC<WeekdayHeaderProps> = ({ weekdays }) => {
  return (
    <div className="flex w-full">
      {weekdays.map((day) => (
        <div
          key={day.toISOString()}
          className="w-[14.2857%] text-center text-xs font-semibold text-gray-400"
        >
          {formatNarrowWeekday(undefined, day)}
        </div>
      ))}
    </div>
  );
};

export default WeekdayHeader;
