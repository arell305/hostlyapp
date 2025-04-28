import { DateTime } from "luxon";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { TIME_ZONE } from "@/types/constants";
import {
  formatShortDate,
  formatNarrowWeekday,
} from "../../../../../utils/luxon";
import CustomCard from "@/components/shared/cards/CustomCard";

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
    const startOfWeek = DateTime.fromJSDate(currentDate)
      .setZone(TIME_ZONE)
      .startOf("week");

    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.plus({ days: i }).toJSDate()
    );
  };

  const weekDates = getWeekDates(date);

  return (
    <CustomCard className="flex flex-col items-center  py-2 px-2  ">
      <div className="flex items-center justify-between w-full max-w-[600px] mb-4 h-[44px]">
        <button
          onClick={() => onNavigate("prev")}
          className="px-3 py-2 hover:bg-cardBackgroundHover rounded"
        >
          <RiArrowDropLeftLine className="text-2xl" />
        </button>
        <h3 className="text-xl leading-[18px] font-sans">
          {formatShortDate(weekDates[0])} - {formatShortDate(weekDates[6])}
        </h3>
        <button
          onClick={() => onNavigate("next")}
          className="px-3 py-2 hover:bg-cardBackgroundHover rounded"
        >
          <RiArrowDropRightLine className="text-2xl" />
        </button>
      </div>

      <div className="flex justify-between w-full mb-2 pt-1.5">
        {weekDates.map((day) => (
          <div
            key={`${day.toISOString()}-label`}
            className="w-[14.2857%] text-center text-xs font-semibold text-gray-600"
          >
            {formatNarrowWeekday(undefined, day)}
          </div>
        ))}
      </div>

      <div className="flex justify-between w-full">
        {weekDates.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = day.toDateString() === date.toDateString();
          const hasEvent = hasEventOnDate(day);

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
                  <div className="absolute w-6 h-6 bg-primaryBlue  rounded-full"></div>
                )}
                <span className="relative">{day.getDate()}</span>
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
