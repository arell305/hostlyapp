"use client";

import Calendar from "react-calendar";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import WeekView from "./WeekView";
import { formatNarrowWeekday } from "@/utils/luxon";

interface CalendarSwitcherProps {
  isWeekView: boolean;
  date: Date;
  today: Date;
  onNavigate: (direction: "prev" | "next") => void;
  hasEventOnDate: (date: Date) => boolean;
  handleActiveStartDateChange: (date: Date | null) => void;
}

export const CalendarSwitcher: React.FC<CalendarSwitcherProps> = ({
  isWeekView,
  date,
  today,
  onNavigate,
  hasEventOnDate,
  handleActiveStartDateChange,
}) => {
  if (isWeekView) {
    return (
      <WeekView
        date={date}
        today={today}
        onNavigate={onNavigate}
        hasEventOnDate={hasEventOnDate}
      />
    );
  }

  return (
    <div className="w-full">
      <Calendar
        value={date}
        calendarType="gregory"
        className=" w-full"
        next2Label={null}
        prev2Label={null}
        nextLabel={
          <div className="px-3 py-2 hover:bg-cardBackgroundHover rounded">
            <RiArrowDropRightLine className="text-2xl " />
          </div>
        }
        prevLabel={
          <div className="px-3 py-2 hover:bg-cardBackgroundHover rounded">
            <RiArrowDropLeftLine className="text-2xl " />
          </div>
        }
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
                    <p className="text-base pb-4">{tileDate.getDate()}</p>
                  </div>
                )}
                {hasEvent && (
                  <div
                    className={`absolute bottom-1 transform 
                    ${isToday ? "-translate-x-[15%]" : "-translate-x-1/2"} 
                    bg-primaryBlue rounded-full w-1.5 h-1.5`}
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
