"use client";

import Calendar from "react-calendar";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import WeekView from "./WeekView";
import { CalendarValue } from "@/types/types";
import { formatNarrowWeekday } from "@/utils/luxon";

interface CalendarSwitcherProps {
  isWeekView: boolean;
  date: Date;
  today: Date;
  onDateClick: (value: CalendarValue) => void;
  onNavigate: (direction: "prev" | "next") => void;
  hasEventOnDate: (date: Date) => boolean;
  handleActiveStartDateChange: (date: Date | null) => void;
}

export const CalendarSwitcher: React.FC<CalendarSwitcherProps> = ({
  isWeekView,
  date,
  today,
  onDateClick,
  onNavigate,
  hasEventOnDate,
  handleActiveStartDateChange,
}) => {
  if (isWeekView) {
    return (
      <WeekView
        date={date}
        today={today}
        onDateClick={onDateClick}
        onNavigate={onNavigate}
        hasEventOnDate={hasEventOnDate}
      />
    );
  }

  return (
    <div className="w-full">
      <Calendar
        onChange={onDateClick}
        value={date}
        calendarType="gregory"
        className="px-2 pt-3 w-full"
        next2Label={null}
        prev2Label={null}
        nextLabel={<RiArrowDropRightLine className="text-xl" />}
        prevLabel={<RiArrowDropLeftLine className="text-xl" />}
        formatShortWeekday={formatNarrowWeekday}
        selectRange={false}
        tileContent={({ date: tileDate, view }) => {
          if (view === "month") {
            const isToday = tileDate.toDateString() === today.toDateString();
            const hasEvent = hasEventOnDate(tileDate);
            return (
              <div className="relative">
                {isToday && (
                  <div className="absolute w-6 h-6 mt-[-38px] ml-[-10px] mr-6 bg-primaryBlue rounded-full">
                    <p className="text-base">{tileDate.getDate()}</p>
                  </div>
                )}
                {hasEvent && (
                  <div
                    className={`absolute bottom-1 transform 
                    ${isToday ? "-translate-x-[15%]" : "-translate-x-1/2"} 
                    bg-customDarkBlue rounded-full w-1.5 h-1.5`}
                  />
                )}
              </div>
            );
          }
          return null;
        }}
        onActiveStartDateChange={({ activeStartDate }) =>
          handleActiveStartDateChange(activeStartDate)
        }
      />
    </div>
  );
};
