"use client";
import { useState, useEffect, useMemo } from "react";
import { getCurrentDate } from "@shared/utils/luxon";
import SelectedDateEvents from "@/features/home/components/calendar/SelectedDateEvents";
import ToggleCalendar from "@/features/home/components/calendar/ToggleCalendar";
import {
  doesDateHaveEvent,
  getEventsForDateRange,
  getVisibleRange,
  navigateDate,
} from "@/shared/utils/calendar";
import { CalendarSwitcher } from "@/features/home/components/calendar/CalendarSwitcher";
import { EventWithExtras } from "@shared/types/convex-types";
import { DateTime } from "luxon";
import { useMonthlyEvents } from "@/domain/events";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import CalendarSwitcherLoading from "@/shared/ui/skeleton/CalendarSwitcherLoading";

interface HomeContentProps {
  pathname: string;
}

const HomeContent: React.FC<HomeContentProps> = ({ pathname }) => {
  const today = getCurrentDate();
  const [date, setDate] = useState<Date>(today);
  const [isWeekView, setIsWeekView] = useState<boolean>(true);
  const [selectedEvents, setSelectedEvents] = useState<EventWithExtras[]>([]);
  const { organization } = useContextOrganization();

  const { month, year } = useMemo(() => {
    const dt = DateTime.fromJSDate(date);
    return { month: dt.month, year: dt.year };
  }, [date]);

  const monthlyEventsData = useMonthlyEvents(organization._id, month, year);

  const { start, end } = useMemo(
    () => getVisibleRange(date, isWeekView),
    [date, isWeekView]
  );
  const [startMs, endMs] = useMemo(
    () => [start.toMillis(), end.toMillis()],
    [start, end]
  );

  useEffect(() => {
    if (!monthlyEventsData) {
      setSelectedEvents([]);
      return;
    }
    setSelectedEvents(getEventsForDateRange(monthlyEventsData, startMs, endMs));
  }, [monthlyEventsData, startMs, endMs]);

  const hasEventOnDate = (d: Date) =>
    doesDateHaveEvent(monthlyEventsData ?? [], d);
  const handleNavigation = (direction: "prev" | "next") =>
    setDate((prev) => navigateDate(prev, direction, isWeekView));

  if (!monthlyEventsData)
    return (
      <CalendarSwitcherLoading isWeekView={isWeekView} date={new Date()} />
    );

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
