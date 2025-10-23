"use client";

import Calendar from "react-calendar";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";

const CalendarLoading: React.FC<{ date: Date }> = ({ date }) => {
  return (
    <div className="relative w-full">
      <Calendar
        value={date}
        calendarType="gregory"
        className="px-2 pt-3 w-full opacity-0 pointer-events-none select-none"
        next2Label={null}
        prev2Label={null}
        nextLabel={<RiArrowDropRightLine className="text-xl" />}
        prevLabel={<RiArrowDropLeftLine className="text-xl" />}
      />

      <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-zinc-800">
        <div className="h-8 w-8 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
      </div>
    </div>
  );
};

export default CalendarLoading;
