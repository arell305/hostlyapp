import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import {
  Datepicker,
  MbscCalendarMarked,
  MbscDatepickerCellClickEvent,
  Page,
  setOptions,
} from "@mobiscroll/react";
import { FC, useMemo, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

setOptions({
  theme: "ios",
  themeVariant: "light",
});

const CalendarComponent: FC = () => {
  const router = useRouter();

  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [selectedDate, setSelectedDate] = useState<string>(""); // Store the selected date in YYYY-MM-DD format
  const [displayDate, setDisplayDate] = useState<string>(""); // Store the formatted date for display

  const eventsForSelectedDate = useQuery(api.events.getEventsByOrgAndDate, {
    clerkOrganizationId: organization?.id || "",
    date: selectedDate,
  });

  const myMarked = useMemo<MbscCalendarMarked[]>(
    () => [
      // Add your marked dates here if needed
    ],
    []
  );

  const handleDateClick = (event: MbscDatepickerCellClickEvent) => {
    if (event.date) {
      const formattedSelectedDate = event.date.toISOString().split("T")[0]; // YYYY-MM-DD format for fetching
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

  const handleAddEventClick = () => {
    if (selectedDate) {
      // Navigate to the Add Event page with the selected date as a query parameter
      router.push(`/add-event`);
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  useEffect(() => {
    if (!orgLoaded) {
      return; // Wait until the organization is loaded
    }

    // Set the default selected date to the current date in the specified format
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0]; // For fetching
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
            />
          </div>
        </div>
        {/* Render the selected date below the calendar */}
      </Page>

      <div className="selected-date mt-4">
        <strong>Selected Date:</strong> {displayDate}
      </div>
      <button
        onClick={handleAddEventClick}
        className="mt-2 shadow-xl w-[200px]  px-6 py-2 rounded-md  bg-customLightBlue text-black font-semibold  hover:bg-customDarkerBlue flex justify-center items-center space-x-2"
      >
        <span className="text-lg">Add Event</span>
      </button>
      {/* Render events or "No events" message */}
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
