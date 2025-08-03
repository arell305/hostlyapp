import { DateTime } from "luxon";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { TIME_ZONE } from "@/types/constants";
import {
  formatShortDate,
  formatNarrowWeekday,
} from "../../../../../utils/luxon";
import CustomCard from "@/components/shared/cards/CustomCard";
import WeekdayHeader from "./WeekDayHeader";
import WeekNavigationHeader from "./WeekNavigationHeader";

interface WeekViewProps {
  date: Date;
  today: Date;
  onDateClick: (date: Date) => void;
  onNavigate: (direction: "prev" | "next") => void;
  hasEventOnDate: (date: Date) => boolean;
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  today,
  onDateClick,
  onNavigate,
  hasEventOnDate,
}) => {
  const getWeekDates = (currentDate: Date) => {
    const luxonDate = DateTime.fromJSDate(currentDate).setZone(TIME_ZONE);
    const jsDate = luxonDate.toJSDate();
    const startOffset = jsDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const sundayStart = DateTime.fromJSDate(jsDate)
      .setZone(TIME_ZONE)
      .minus({ days: startOffset });

    return Array.from({ length: 7 }, (_, i) =>
      sundayStart.plus({ days: i }).toJSDate()
    );
  };

  const weekDates = getWeekDates(date);
  console.log("weekDates", weekDates);
  return (
    <CustomCard className="flex flex-col items-center  py-2 px-2  ">
      <WeekNavigationHeader
        onNavigate={onNavigate}
        startDate={formatShortDate(weekDates[0])}
        endDate={formatShortDate(weekDates[6])}
      />

      <WeekdayHeader weekdays={weekDates} />

      <div className="flex justify-between w-full">
        {weekDates.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = day.toDateString() === date.toDateString();
          const hasEvent = hasEventOnDate(day);
          const isOutsideCurrentMonth =
            day.getMonth() !== date.getMonth() ||
            day.getFullYear() !== date.getFullYear();

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={`react-calendar__tile w-[14.2857%] aspect-square flex items-center justify-center 
        text-lg font-medium transition-all overflow-hidden
        md:hover:bg-cardBackgroundHover
        ${isSelected ? "md:hover:hover:bg-cardBackgroundHover react-calendar__tile--active" : ""}`}
              onClick={() => onDateClick(day)}
            >
              <abbr
                aria-label={day.toDateString()}
                className="relative font-medium flex flex-col justify-center items-center leading-none translate-y-[1px]"
              >
                {isToday && (
                  <div className="absolute w-6 h-6 bg-primaryBlue rounded-full"></div>
                )}
                <span
                  className={`relative ${
                    isOutsideCurrentMonth ? "text-gray-400" : "text-white"
                  }`}
                >
                  {day.getDate()}
                </span>
                {hasEvent && (
                  <div className="absolute -bottom-[16px] left-[50%] transform -translate-x-[50%] bg-customDarkBlue rounded-full w-[6px] h-[6px]" />
                )}
              </abbr>
            </button>
          );
        })}
      </div>
    </CustomCard>
  );
};

export default WeekView;
