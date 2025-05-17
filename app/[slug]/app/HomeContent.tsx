"use client";
import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getCurrentDate } from "../../../utils/luxon";
import { EventSchema } from "@/types/schemas-types";
import { Notification } from "./components/ui/Notification";
import FullLoading from "./components/loading/FullLoading";
import ErrorComponent from "./components/errors/ErrorComponent";
import { DateTime } from "luxon";
import { ResponseStatus } from "@/types/enums";
import SelectedDateEvents from "./components/calendar/SelectedDateEvents";
import { OrganizationSchema, CalendarValue } from "@/types/types";
import ToggleCalendar from "./components/calendar/ToggleCalendar";
import {
  doesDateHaveEvent,
  getEventsForDate,
  navigateDate,
  normalizeCalendarDate,
} from "../../../utils/calendar";
import { CalendarSwitcher } from "./components/calendar/CalendarSwitcher";
import { Button } from "@/components/ui/button";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import { Plus } from "lucide-react";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import Link from "next/link";
import NProgress from "nprogress";

const today = getCurrentDate();

interface HomeContentProps {
  organization: OrganizationSchema;
  canCreateEvents: boolean;
  showStripeNotification: boolean;
  pathname: string;
}

const HomeContent: React.FC<HomeContentProps> = ({
  organization,
  canCreateEvents,
  showStripeNotification,
  pathname,
}) => {
  const [date, setDate] = useState(() => today);
  const [isWeekView, setIsWeekView] = useState(true);
  const [calendarMonthYear, setCalendarMonthYear] = useState({
    month: 0,
    year: 0,
  });
  const [selectedEvents, setSelectedEvents] = useState<EventSchema[]>([]);

  const monthlyEventsData = useQuery(
    api.events.getEventsByMonth,
    organization
      ? {
          organizationId: organization._id,
          year: calendarMonthYear.year,
          month: calendarMonthYear.month,
        }
      : "skip"
  );

  useEffect(() => {
    setCalendarMonthYear({
      month: DateTime.fromJSDate(date).month,
      year: DateTime.fromJSDate(date).year,
    });
  }, [date]);

  useEffect(() => {
    if (monthlyEventsData?.data?.eventData) {
      setSelectedEvents(
        getEventsForDate(monthlyEventsData.data.eventData, date)
      );
    } else {
      setSelectedEvents([]);
    }
  }, [monthlyEventsData, date]);

  const hasEventOnDate = (date: Date) =>
    doesDateHaveEvent(monthlyEventsData?.data?.eventData ?? [], date);
  const handleNavigation = (direction: "prev" | "next") =>
    setDate(navigateDate(date, direction));
  const handleDateClick = (value: CalendarValue) =>
    setDate(normalizeCalendarDate(value));

  if (!monthlyEventsData) return <FullLoading />;
  if (monthlyEventsData.status === ResponseStatus.ERROR)
    return <ErrorComponent message={monthlyEventsData.error} />;

  return (
    <SectionContainer>
      <SectionHeaderWithAction
        title="My Events"
        actions={
          canCreateEvents && (
            <Link
              href={`${pathname}/add-event`}
              onClick={() => NProgress.start()}
            >
              <Button size="heading">
                <Plus size={20} />
                <span>Add Event</span>
              </Button>
            </Link>
          )
        }
      />
      {showStripeNotification && (
        <div className=" md:mb-4">
          <Notification
            title="Stripe Required"
            description="Please integrate Stripe to accept payments."
            route="stripe"
          />
        </div>
      )}

      <CalendarSwitcher
        isWeekView={isWeekView}
        date={date}
        today={today}
        onDateClick={handleDateClick}
        onNavigate={handleNavigation}
        hasEventOnDate={hasEventOnDate}
        handleActiveStartDateChange={(date) => date && setDate(date)}
      />

      <ToggleCalendar
        isWeekView={isWeekView}
        onToggle={() => setIsWeekView(!isWeekView)}
      />

      <SelectedDateEvents
        date={date}
        events={selectedEvents}
        pathname={pathname}
      />
    </SectionContainer>
  );
};

export default HomeContent;
