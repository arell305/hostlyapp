"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { RiArrowDownWideLine, RiArrowUpWideLine } from "react-icons/ri";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  formatLongDate,
  formatNarrowWeekday,
  formatShortDate,
  getCurrentDate,
} from "../../../utils/luxon";
import { EventSchema } from "@/types/schemas-types";
import EventPreview from "./components/calendar/EventPreview";
import { ResponseStatus, UserRole } from "../../../utils/enum";
import { TIME_ZONE } from "@/types/constants";
import { Protect, useAuth } from "@clerk/nextjs";
import { Notification } from "./components/ui/Notification";
import FullLoading from "./components/loading/FullLoading";
import ErrorComponent from "./components/errors/ErrorComponent";
import { ClerkPermissionsEnum } from "@/types/enums";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { DateTime } from "luxon";
import PlusTierData from "./components/PlusTierData";

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

  const getWeekDates = (currentDate: Date) => {
    const startOfWeek = DateTime.fromJSDate(currentDate)
      .setZone(TIME_ZONE)
      .startOf("week");

    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.plus({ days: i }).toJSDate()
    );
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

  const renderWeekView = () => {
    const weekDates = getWeekDates(date);
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
              {formatNarrowWeekday(undefined, day)}
            </div>
          ))}
        </div>
        {/* Week Days */}
        <div className="flex justify-between w-full ">
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
                  md:hover:bg-gray-100
                  ${isSelected ? "md:hover:bg-gray-100 react-calendar__tile--active" : ""}`}
                onClick={() => handleDateClick(day)}
              >
                <abbr
                  aria-label={day.toDateString()}
                  className="relative font-medium flex flex-col justify-center items-center leading-none translate-y-[1px]"
                >
                  {isToday && (
                    <div className="absolute w-6 h-6 bg-gray-300 mt-1 rounded-full"></div>
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
      </div>
    );
  };

  if (!monthlyEventsData) {
    return <FullLoading />;
  }

  if (monthlyEventsData.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={monthlyEventsData.error} />;
  }

  return (
    <div className="mt-2 px-1 max-w-[600px] min-w-[420px] mx-auto">
      {!connectedAccountEnabled && isCompanyAdmin && (
        <div className="p-1">
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

      <div className="mt-1 mb-5 ">
        <div className="events-list mt-4">
          <h3 className="font-bold text-2xl md:text-3xl mb-4 font-playfair pl-4">
            {formatLongDate(date)}
          </h3>
          {selectedEvents.length > 0 ? (
            <div className="py-4  flex flex-wrap justify-center  gap-x-4 gap-y-3 bg-gray-200 md:rounded">
              {selectedEvents.map((event: EventSchema) => {
                return (
                  <EventPreview
                    key={event._id}
                    eventData={event}
                    isApp={true}
                  />
                );
              })}
            </div>
          ) : (
            <p className="pl-4 border-b pb-4">
              No events for the selected date.
            </p>
          )}
        </div>
      </div>
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
