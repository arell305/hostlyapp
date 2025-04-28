"use client";
import React, { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getCurrentDate } from "../../../utils/luxon";
import { EventSchema, SubscriptionSchema } from "@/types/schemas-types";
import { Notification } from "./components/ui/Notification";
import FullLoading from "./components/loading/FullLoading";
import ErrorComponent from "./components/errors/ErrorComponent";
import { DateTime } from "luxon";
import PlusTierData from "./components/PlusTierData";
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
import router from "next/router";
import { Button } from "@/components/ui/button";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import { PlusIcon } from "lucide-react";

const today = getCurrentDate();

interface HomeContentProps {
  organization: OrganizationSchema;
  canCreateEvents: boolean;
  showPlusTierData: boolean;
  showStripeNotification: boolean;
  subscription: SubscriptionSchema;
  handleAddEventClick: () => void;
}

const HomeContent: React.FC<HomeContentProps> = ({
  organization,
  canCreateEvents,
  showPlusTierData,
  showStripeNotification,
  subscription,
  handleAddEventClick,
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
    <div className="px-1 md:px-0 max-w-2xl min-w-[420px] mx-auto">
      <SectionHeaderWithAction
        title="My Events"
        actions={
          canCreateEvents && (
            <Button onClick={handleAddEventClick} className="gap-1">
              <PlusIcon className="" />
              Add Event
            </Button>
          )
        }
      />
      {showStripeNotification && (
        <div className="p-1 md:pb-2">
          <Notification
            title="Stripe Required"
            description="Please integrate Stripe to accept payments."
            variant="customDarkBlue"
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

      <SelectedDateEvents date={date} events={selectedEvents} />

      {showPlusTierData && <PlusTierData subscription={subscription} />}
    </div>
  );
};

export default HomeContent;
