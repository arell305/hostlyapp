import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import {
  Datepicker,
  MbscCalendarMarked,
  MbscDatepickerCellClickEvent,
  Page,
  setOptions,
} from "@mobiscroll/react";

setOptions({
  theme: "ios",
  themeVariant: "light",
});

const CalendarComponent: React.FC = () => {
  const router = useRouter();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");

  const events = useQuery(api.events.getEventsByOrgAndMonth, {
    clerkOrganizationId: organization?.id || "",
    year: currentMonth.getFullYear(),
    month: currentMonth.getMonth() + 1,
  });

  const eventsForSelectedDate = useQuery(api.events.getEventsByOrgAndDate, {
    clerkOrganizationId: organization?.id || "",
    date: selectedDate,
  });

  const myMarked = useMemo<MbscCalendarMarked[]>(() => {
    if (!events) return [];
    return events.map((event) => ({
      date: new Date(event.date),
      color: "#ff0000", // You can customize the color
    }));
  }, [events]);

  const handleDateClick = (event: MbscDatepickerCellClickEvent) => {
    if (event.date) {
      const formattedSelectedDate = event.date.toISOString().split("T")[0];
      const formattedDisplayDate = event.date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setSelectedDate(formattedSelectedDate);
      setDisplayDate(formattedDisplayDate);
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  useEffect(() => {
    if (!orgLoaded) return;

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const formattedDisplayToday = today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setSelectedDate(formattedToday);
    setDisplayDate(formattedDisplayToday);
  }, [orgLoaded, organization]);

  return (
    <>
      <Page className="max-w-[820px]">
        <div className="mbsc-col-sm-12 mbsc-col-md-4 max-w-[800px]">
          <div className="mbsc-form-group">
            <div className="mbsc-form-group-title">Events</div>
            <Datepicker
              display="inline"
              marked={myMarked}
              onCellClick={handleDateClick}
              onPageChange={(event) => {
                setCurrentMonth(event.firstDay);
              }}
              showOuterDays={false}
              className="h-[100px]"
            />
          </div>
        </div>
      </Page>

      <div className="selected-date mt-4">
        <strong>Selected Date:</strong> {displayDate}
      </div>
      <div className="events-list mt-4">
        {eventsForSelectedDate && eventsForSelectedDate.length > 0 ? (
          <ul>
            {eventsForSelectedDate.map((event, index) => (
              <li
                key={index}
                onClick={() => handleEventClick(event._id)}
                style={{ cursor: "pointer" }}
              >
                {event.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No events</p>
        )}
      </div>
    </>
  );
};

export default CalendarComponent;
