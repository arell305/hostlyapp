"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { RiArrowDownWideLine, RiArrowUpWideLine } from "react-icons/ri";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatNarrowWeekday, getCurrentDate } from "../../../utils/luxon";
import { EventSchema } from "@/types/schemas-types";
import { TIME_ZONE } from "@/types/constants";
import { Protect, useAuth } from "@clerk/nextjs";
import { Notification } from "./components/ui/Notification";
import FullLoading from "./components/loading/FullLoading";
import ErrorComponent from "./components/errors/ErrorComponent";
import { ClerkPermissionsEnum } from "@/types/enums";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { DateTime } from "luxon";
import PlusTierData from "./components/PlusTierData";
import { ResponseStatus, UserRole } from "@/types/enums";
import WeekView from "./components/calendar/WeekView";
import SelectedDateEvents from "./components/calendar/SelectedDateEvents";
type Value = Date | null | [Date | null, Date | null];

const WeekViewCalendar: React.FC = () => {
  const [date, setDate] = useState(() => getCurrentDate());
  const [isWeekView, setIsWeekView] = useState<boolean>(true);
  const [calendarMonthYear, setCalendarMonthYear] = useState({
    month: 0,
    year: 0,
  });
  const today = getCurrentDate();
  const [selectedEvents, setSelectedEvents] = useState<EventSchema[]>([]);
  const { has } = useAuth();

  const isCompanyAdmin = has ? has({ role: UserRole.Admin }) : false;

  const {
    organization,
    organizationContextError,
    connectedAccountEnabled,
    subscription,
  } = useContextOrganization();

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
      const selectedDate = DateTime.fromJSDate(date);
      setSelectedEvents(
        monthlyEventsData.data.eventData.filter((event: EventSchema) => {
          const eventStartTime = DateTime.fromMillis(event.startTime).setZone(
            TIME_ZONE
          );
          return (
            eventStartTime.hasSame(selectedDate, "day") &&
            eventStartTime.hasSame(selectedDate, "month") &&
            eventStartTime.hasSame(selectedDate, "year")
          );
        })
      );
    } else {
      setSelectedEvents([]);
    }
  }, [monthlyEventsData, date]);

  const handleActiveStartDateChange = (activeStartDate: Date | null) => {
    if (!activeStartDate) {
      return;
    }
    setDate(activeStartDate);
  };

  const hasEventOnDate = (date: Date): boolean => {
    if (!monthlyEventsData?.data) {
      return false;
    }

    const selectedDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);

    return monthlyEventsData.data.eventData.some((event: EventSchema) => {
      const eventDate = DateTime.fromMillis(event.startTime).setZone(TIME_ZONE);
      return eventDate.hasSame(selectedDate, "day");
    });
  };

  const handleNavigation = (direction: "prev" | "next") => {
    const newDate = DateTime.fromJSDate(date)
      .setZone(TIME_ZONE)
      .plus({ days: direction === "next" ? 7 : -7 });
    setDate(newDate.toJSDate());
  };

  const handleDateClick = (value: Value) => {
    if (!value) {
      return;
    }

    const selectedDate = Array.isArray(value)
      ? value[0]
        ? DateTime.fromJSDate(value[0]).setZone(TIME_ZONE)
        : DateTime.now().setZone(TIME_ZONE)
      : DateTime.fromJSDate(value).setZone(TIME_ZONE);

    setDate(selectedDate.toJSDate());
  };

  if (!subscription || !organization) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  if (!monthlyEventsData) {
    return <FullLoading />;
  }

  if (monthlyEventsData.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={monthlyEventsData.error} />;
  }

  return (
    <div className="mt-2 md:mt-0 px-1 md:px-0 max-w-2xl min-w-[420px] mx-auto">
      {!connectedAccountEnabled && isCompanyAdmin && (
        <div className="p-1 md:pb-2">
          <Notification
            title="Stripe Required"
            description="Please integrate Stripe to accept payments."
            variant="customDarkBlue"
            route="stripe"
          />
        </div>
      )}
      {/* Show Week or Month View */}
      {isWeekView ? (
        <WeekView
          date={date}
          today={today}
          onDateClick={handleDateClick}
          onNavigate={handleNavigation}
          hasEventOnDate={hasEventOnDate}
        />
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
          selectRange={false}
          tileContent={({ date, view }) => {
            if (view === "month") {
              const isToday = date.toDateString() === today.toDateString();
              const hasEvent = hasEventOnDate(date);
              return (
                <div className="relative">
                  {isToday && (
                    <div className="absolute w-6 h-6 mt-[-38px] ml-[-10px] mr-6 bg-gray-300 rounded-full">
                      <p className="text-base">{date.getDate()}</p>
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

      <SelectedDateEvents date={date} events={selectedEvents} />

      <Protect
        condition={(has) =>
          has({ permission: ClerkPermissionsEnum.ORG_EVENTS_CREATE })
        }
      >
        <PlusTierData subscription={subscription} />
      </Protect>
    </div>
  );
};

export default WeekViewCalendar;
