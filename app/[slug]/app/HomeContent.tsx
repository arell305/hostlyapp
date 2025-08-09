"use client";
import React, { useState, useEffect, useMemo } from "react";
import { getCurrentDate } from "../../../utils/luxon";
import SelectedDateEvents from "./components/calendar/SelectedDateEvents";
import ToggleCalendar from "./components/calendar/ToggleCalendar";
import {
  doesDateHaveEvent,
  getEventsForDate,
  getEventsForDateRange,
  getVisibleRange,
  navigateDate,
  normalizeCalendarDate,
} from "../../../utils/calendar";
import { CalendarSwitcher } from "./components/calendar/CalendarSwitcher";
import { EventWithExtras } from "@/types/convex-types";
import { useMonthlyEvents } from "./hooks/useMonthlyEvents";
import { CalendarValue } from "@/types/types";
import { DateTime } from "luxon";

interface HomeContentProps {
  pathname: string;
}

const HomeContent: React.FC<HomeContentProps> = ({ pathname }) => {
  const today = getCurrentDate();
  const [date, setDate] = useState<Date>(today);
  const [isWeekView, setIsWeekView] = useState<boolean>(true);
  const [selectedEvents, setSelectedEvents] = useState<EventWithExtras[]>([]);

  const { month, year } = useMemo(() => {
    const dt = DateTime.fromJSDate(date);
    return { month: dt.month, year: dt.year };
  }, [date]);

  const { component: monthlyEventsComponent, events: monthlyEventsData } =
    useMonthlyEvents({ month, year }, isWeekView);

  const { start, end } = useMemo(
    () => getVisibleRange(date, isWeekView),
    [date, isWeekView]
  );

  useEffect(() => {
    if (!monthlyEventsData) {
      setSelectedEvents([]);
      return;
    }
    setSelectedEvents(
      getEventsForDateRange(monthlyEventsData, start.toJSDate(), end.toJSDate())
    );
  }, [monthlyEventsData, start, end]);

  const hasEventOnDate = (d: Date) =>
    doesDateHaveEvent(monthlyEventsData ?? [], d);
  // HomeContent.tsx
  const handleNavigation = (direction: "prev" | "next") =>
    setDate((prev) => navigateDate(prev, direction, isWeekView));

  if (monthlyEventsComponent) return monthlyEventsComponent;

  return (
    <div>
      <CalendarSwitcher
        isWeekView={isWeekView}
        date={date}
        today={today}
        onNavigate={handleNavigation}
        hasEventOnDate={hasEventOnDate}
        handleActiveStartDateChange={(d) => d && setDate(d)}
      />

      <ToggleCalendar
        isWeekView={isWeekView}
        onToggle={() => setIsWeekView(!isWeekView)}
      />

      <SelectedDateEvents
        events={selectedEvents}
        pathname={pathname}
        isWeekView={isWeekView}
      />
    </div>
  );
};

export default HomeContent;
