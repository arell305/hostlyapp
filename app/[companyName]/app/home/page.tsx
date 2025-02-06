"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatNarrowWeekday, formatShortDate } from "../../../../utils/moment";
import { tileClassName } from "../../../../utils/calendar";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { RiArrowDownWideLine, RiArrowUpWideLine } from "react-icons/ri";
import { isSameDay } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";

type Value = Date | null | [Date | null, Date | null];

const WeekViewCalendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isWeekView, setIsWeekView] = useState<boolean>(true);
  const [calendarMonthYear, setCalendarMonthYear] = useState({
    month: 0,
    year: 0,
  });
  const today = new Date();

  const { companyName: companyNameParams } = useParams();

  const cleanCompanyName =
    typeof companyNameParams === "string"
      ? companyNameParams.split("?")[0].toLowerCase()
      : "";
  const monthlyEventsData = useQuery(
    api.events.getEventsByNameAndMonth,
    cleanCompanyName
      ? {
          organizationName: cleanCompanyName,
          year: calendarMonthYear.year,
          month: calendarMonthYear.month,
        }
      : "skip"
  );

  console.log("monthly evnets", monthlyEventsData);
  useEffect(() => {
    // Update month and year when the date changes
    setCalendarMonthYear({
      month: date.getMonth() + 1, // Month is 0-indexed
      year: date.getFullYear(),
    });
  }, [date]);

  // ✅ Get start and end of the week for the selected date
  const getWeekDates = (currentDate: Date) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start on Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  // ✅ Handle navigation between weeks
  const handleNavigation = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setDate(newDate);
  };

  // ✅ Handle clicking a date in week view
  const handleDateClick = (value: Value) => {
    console.log("value", value);
    if (!value) return; // ✅ Handle null case
    if (Array.isArray(value)) {
      setDate(value[0] || new Date()); // ✅ Use first date if it's a range
    } else {
      setDate(value); // ✅ Set selected date
    }
  };

  // ✅ Get the current month and year from the calendar
  const getCalendarMonthYear = (currentDate: Date) => {
    const month = currentDate.getMonth() + 1; // Month is 0-indexed
    const year = currentDate.getFullYear();
    return { month, year };
  };

  // ✅ Render Week View
  const renderWeekView = () => {
    const weekDates = getWeekDates(date);
    const currentMonthYear = getCalendarMonthYear(date);
    return (
      <div className="flex flex-col items-center border-b pb-2 px-2 pt-3">
        {/* Week Navigation */}
        <div className="flex items-center justify-between w-full max-w-[600px] mb-4 h-[44px]">
          {" "}
          <button
            onClick={() => handleNavigation("prev")}
            className="px-3 py-2 hover:bg-gray-100 rounded"
          >
            <RiArrowDropLeftLine className="text-xl" />
          </button>
          <h3
            className="text-xl leading-[18px]
 font-sans"
          >
            {formatShortDate(weekDates[0])} - {formatShortDate(weekDates[6])}
          </h3>
          <button
            onClick={() => handleNavigation("next")}
            className="px-3 py-2 hover:bg-gray-100 rounded"
          >
            <RiArrowDropRightLine className="text-xl" />
          </button>
        </div>

        <div className="flex justify-between w-full mb-2 pt-1.5">
          {weekDates.map((day) => (
            <div
              key={`${day.toISOString()}-label`}
              className="w-[14.2857%] text-center text-xs font-semibold text-gray-600"
            >
              {formatNarrowWeekday(undefined, day)} {/* Mon, Tue, etc. */}
            </div>
          ))}
        </div>
        {/* Week Days */}
        <div className="flex justify-between w-full ">
          {weekDates.map((day) => {
            const isToday = day.toDateString() === today.toDateString();
            const isSelected = day.toDateString() === date.toDateString();
            return (
              <button
                key={day.toISOString()}
                type="button"
                className={`react-calendar__tile w-[14.2857%] aspect-square flex items-center justify-center 
                  text-lg font-medium transition-all overflow-hidden
                  md:hover:bg-gray-100
                  ${isSelected ? "md:hover:bg-gray-100 react-calendar__tile--active" : ""}`}
                onClick={() => handleDateClick(day)}
              >
                <abbr
                  aria-label={day.toDateString()}
                  className="relative font-medium flex flex-col justify-center items-center leading-none translate-y-[1px]"
                >
                  {isToday && (
                    <div className="absolute w-6 h-6 mt-1 bg-gray-300 rounded-full"></div>
                  )}
                  <span className="relative">{day.getDate()}</span>
                </abbr>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-2 px-1 max-w-[600px] min-w-[420px]">
      {/* Show Week or Month View */}
      {isWeekView ? (
        renderWeekView()
      ) : (
        <Calendar
          onChange={handleDateClick}
          value={date}
          calendarType="gregory"
          className="px-2 pt-3 min-w-[340px] max-w-[400px]" // Ensure w-full is applied
          next2Label={null}
          prev2Label={null}
          nextLabel={<RiArrowDropRightLine className="text-xl" />}
          prevLabel={<RiArrowDropLeftLine className="text-xl" />}
          formatShortWeekday={formatNarrowWeekday} // Use custom formatting function
          tileClassName={tileClassName}
        />
      )}
      <div className="flex justify-center">
        <button
          onClick={() => setIsWeekView(!isWeekView)}
          className="mt-.5  text-gray-600 hover:text-gray-900 transition hover:bg-gray-100 rounded"
        >
          {isWeekView ? (
            <RiArrowDownWideLine className="text-3xl" /> // ⬇️ Show Month View
          ) : (
            <RiArrowUpWideLine className="text-3xl" /> // ⬆️ Show Week View
          )}
        </button>
      </div>
    </div>
  );
};

export default WeekViewCalendar;
