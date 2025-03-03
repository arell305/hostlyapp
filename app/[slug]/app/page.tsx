"use client";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { RiArrowDownWideLine, RiArrowUpWideLine } from "react-icons/ri";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from "next/navigation";
import {
  convertToPST,
  formatDateMDY,
  formatLongDate,
  formatNarrowWeekday,
  formatShortDate,
} from "../../../utils/luxon";
import { EventSchema } from "@/types/schemas-types";
import EventPreview from "./components/calendar/EventPreview";
import { SubscriptionTier, UserRole } from "../../../utils/enum";
import { PLUS_GUEST_LIST_LIMIT } from "@/types/constants";
import { Protect, useAuth } from "@clerk/nextjs";
import { useIsStripeEnabled } from "@/hooks/useIsStripeEnabled";
import { Notification } from "./components/ui/Notification";

type Value = Date | null | [Date | null, Date | null];

const WeekViewCalendar: React.FC = () => {
  const [date, setDate] = useState<Date>(convertToPST(new Date()));
  const [isWeekView, setIsWeekView] = useState<boolean>(true);
  const [calendarMonthYear, setCalendarMonthYear] = useState({
    month: 0,
    year: 0,
  });
  const today = convertToPST(new Date());
  const [selectedEvents, setSelectedEvents] = useState<EventSchema[]>([]);
  const { has } = useAuth();

  const { companyName: companyNameParams } = useParams();

  const isCompanyAdmin = has ? has({ role: UserRole.Admin }) : null;

  const cleanCompanyName =
    typeof companyNameParams === "string"
      ? companyNameParams.split("?")[0].toLowerCase()
      : "";

  const { isStripeEnabled } = useIsStripeEnabled({
    companyName: cleanCompanyName,
  });

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
  const subscriptionTierData = useQuery(
    api.customers.GetCustomerTierByOrganizationName,
    cleanCompanyName ? { name: cleanCompanyName } : "skip"
  );
  const subscriptionBillingCycle = useQuery(
    api.subscription.getSubDatesAndGuestEventsCountByDate,
    subscriptionTierData?.data?.customerTier === SubscriptionTier.PLUS
      ? {
          customerId: subscriptionTierData.data.customerId,
          date: date.getTime(),
        }
      : "skip"
  );

  useEffect(() => {
    // Update month and year when the date changes
    setCalendarMonthYear({
      month: date.getMonth() + 1, // Month is 0-indexed
      year: date.getFullYear(),
    });
  }, [date]);

  useEffect(() => {
    if (monthlyEventsData?.data?.eventData) {
      const selectedDate = convertToPST(date);
      setSelectedEvents(
        monthlyEventsData.data.eventData.filter((event: EventSchema) => {
          const eventStartTime = convertToPST(new Date(event.startTime));
          return (
            eventStartTime.getFullYear() === selectedDate.getFullYear() &&
            eventStartTime.getMonth() === selectedDate.getMonth() &&
            eventStartTime.getDate() === selectedDate.getDate()
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
    if (!monthlyEventsData || !monthlyEventsData.data) {
      return false;
    }

    const timeZoneDate = convertToPST(date);

    return monthlyEventsData.data.eventData.some((event: EventSchema) => {
      const eventDate = new Date(event.startTime);
      const timeZoneEventDate = convertToPST(eventDate);
      return (
        timeZoneEventDate.getFullYear() === timeZoneDate.getFullYear() &&
        timeZoneEventDate.getMonth() === timeZoneDate.getMonth() &&
        timeZoneEventDate.getDate() === timeZoneDate.getDate()
      );
    });
  };

  const getWeekDates = (currentDate: Date) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start on Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const handleNavigation = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setDate(newDate);
  };

  const handleDateClick = (value: Value) => {
    if (!value) {
      return;
    }

    let selectedDate: Date = Array.isArray(value)
      ? value[0] || new Date()
      : value;

    setDate(convertToPST(selectedDate));
  };

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

  return (
    <div className="mt-2 px-1 max-w-[600px] min-w-[420px] mx-auto">
      {!isStripeEnabled && isCompanyAdmin && (
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
                return <EventPreview eventData={event} isApp={true} />;
              })}
            </div>
          ) : (
            <p className="pl-4 border-b pb-4">
              No events for the selected date.
            </p>
          )}
        </div>
      </div>
      <Protect condition={(has) => has({ permission: "org:events:create" })}>
        {subscriptionBillingCycle && subscriptionBillingCycle.data && (
          <div className="mb-8">
            <h4 className="font-bold text-xl md:text-2xl font-playfair pl-4">
              Plus Tier Data
            </h4>
            <div className="border-b py-3 px-4">
              <p className="font-bold">Subscription Cycle</p>
              <p>
                {formatDateMDY(
                  subscriptionBillingCycle.data?.billingCycle.startDate
                )}{" "}
                -{" "}
                {formatDateMDY(
                  subscriptionBillingCycle.data?.billingCycle.endDate
                )}
              </p>
            </div>
            <div className=" py-3 px-4 border-b">
              <p className="font-bold">Guest List Events For Cycle</p>
              <p>
                {subscriptionBillingCycle.data.billingCycle.eventCount} /{" "}
                {PLUS_GUEST_LIST_LIMIT}
              </p>
            </div>
          </div>
        )}
      </Protect>
    </div>
  );
};

export default WeekViewCalendar;
