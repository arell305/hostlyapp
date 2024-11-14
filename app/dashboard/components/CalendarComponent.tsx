import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";
import {
  Datepicker,
  MbscCalendarMarked,
  Page,
  setOptions,
  momentTimezone,
} from "@mobiscroll/react";
import moment from "moment-timezone";
import { CalendarLoading } from "./loading/CalendarLoading"; // Import the CalendarLoading component
import EventStats from "./EventStats";
import { SubscriptionTier } from "../../../utils/enum";

setOptions({
  theme: "ios",
  themeVariant: "light",
  timezonePlugin: momentTimezone,
});
momentTimezone.moment = moment;

type CalendarComponentProps = {
  organizationId?: string;
  companyName?: string | null;
};

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  organizationId,
  companyName,
}) => {
  const router = useRouter();
  const todayInPST = moment().tz("America/Los_Angeles").startOf("day").toDate();
  const [selected, setSelected] = useState<Date | null>(todayInPST);
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    moment().tz("America/Los_Angeles").startOf("month")
  );
  const [displayDate, setDisplayDate] = useState<string>("");
  const [matchingEvents, setMatchingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Single loading state for entire page

  // Determine which organization ID to use
  const activeOrgId = organizationId || (orgLoaded ? organization?.id : "");
  const displayName = companyName || (orgLoaded ? organization?.name : "");

  useEffect(() => {
    if (!activeOrgId) return;
    const today = moment().tz("America/Los_Angeles");
    setDisplayDate(today.format("dddd, MMMM D, YYYY"));
  }, [activeOrgId]);

  // Fetch events with loading state
  const events = useQuery(api.events.getEventsByOrgAndMonth, {
    clerkOrganizationId: activeOrgId || "",
    year: displayedMonth.year(),
    month: displayedMonth.month() + 1,
  });

  // Handle loading state update when events are fetched
  useEffect(() => {
    if (events) {
      setLoading(false); // Set loading to false when events are loaded
    }
  }, [events]);

  const myMarked = useMemo<MbscCalendarMarked[]>(() => {
    if (!events) return [];
    return events.map((event) => {
      const pstDate = moment(event.startTime).tz("America/Los_Angeles");
      return {
        date: pstDate.format("YYYY-MM-DD"),
        color: "#ff0000",
        event: event,
      };
    });
  }, [events]);

  const result = useQuery(
    api.customers.getCustomerSubscriptionTier,
    activeOrgId ? { clerkOrganizationId: activeOrgId } : "skip"
  );

  const uniqueDatesSet = new Set(myMarked.map((item) => item.date));
  const uniqueDates = Array.from(uniqueDatesSet).map((date) => ({
    date,
    color: "#ff0000",
  }));

  const handleEventClick = (eventId: string) => {
    if (companyName && organizationId) {
      router.push(`/events/${eventId}?name=${companyName}`);
    } else {
      router.push(`/events/${eventId}`);
    }
  };

  const selectedChange = (ev: { value: any }) => {
    const userLocalDate = moment(ev.value).tz(moment.tz.guess());
    const pstDate = userLocalDate
      .tz("America/Los_Angeles", true)
      .startOf("day");
    const formattedDate = pstDate.format("dddd, MMMM D, YYYY");
    const selectedDateIn = pstDate.format("YYYY-MM-DD");
    setDisplayDate(formattedDate);
    setSelected(pstDate.toDate());
    const matchingEvents = myMarked.filter(
      (event) => event.date === selectedDateIn
    );
    setMatchingEvents(matchingEvents);
  };

  const handleMonthChange = (event: { firstDay: Date }) => {
    const newMonth = moment(event.firstDay)
      .tz("America/Los_Angeles")
      .startOf("month");
    setDisplayedMonth(newMonth);
  };
  const isPlusTier = result?.subscriptionTier === SubscriptionTier.PLUS;
  console.log("resut", isPlusTier);
  return (
    <>
      {loading || !result ? (
        <CalendarLoading />
      ) : (
        <>
          {isPlusTier && (
            <EventStats
              nextResetDate={result.nextCycle}
              numberOfEvents={result.guestListEventCount}
            />
          )}
          <Page className="max-w-[820px]">
            <div className="mbsc-col-sm-12 mbsc-col-md-4 max-w-[800px]">
              <div className="mbsc-form-group">
                <div className="mbsc-form-group-title">
                  {displayName} Events
                </div>

                <Datepicker
                  display="inline"
                  marked={uniqueDates}
                  dataTimezone="America/Los_Angeles"
                  displayTimezone="America/Los_Angeles"
                  onChange={selectedChange}
                  onPageChange={handleMonthChange}
                  value={selected}
                  controls={["calendar"]}
                />
              </div>
            </div>
          </Page>
          <div className="selected-date mt-4">
            <strong>Selected Date:</strong> {displayDate}
          </div>
          <div className="events-list mt-4">
            {matchingEvents.length > 0 ? (
              <div className="events-list mt-4">
                <h3>Matching Events:</h3>
                <ul>
                  {matchingEvents.map((event, index) => (
                    <li
                      key={index}
                      onClick={() => handleEventClick(event.event._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {event.event.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No matching events found.</p>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default CalendarComponent;
