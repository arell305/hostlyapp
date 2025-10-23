"use client";

import WeekViewLoading from "./WeekLoading";
import CalendarLoading from "./CalendarLoading";

type CalendarSwitcherLoadingProps = {
  isWeekView: boolean;
  date: Date;
  className?: string;
};

const CalendarSwitcherLoading: React.FC<CalendarSwitcherLoadingProps> = ({
  isWeekView,
  date,
  className,
}) => {
  if (isWeekView) {
    return <WeekViewLoading className={className} />;
  }
  return <CalendarLoading date={date} />;
};

export default CalendarSwitcherLoading;
