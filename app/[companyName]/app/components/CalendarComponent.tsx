import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Protect, useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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
import { SubscriptionTier, UserRoleEnum } from "../../../../utils/enum";
import { useUserRole } from "@/hooks/useUserRole";
import { EventSchema } from "@/types/types";
import EventPreview from "./calendar/EventPreview";
import Link from "next/link";

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
  const { companyName: companyNameParams } = useParams();
  const cleanCompanyName =
    typeof companyNameParams === "string"
      ? companyNameParams.split("?")[0].toLowerCase()
      : "";

  const { role, isLoading: isClerkLoading } = useUserRole();
  const todayInPST = moment().tz("America/Los_Angeles").startOf("day").toDate();
  const [selected, setSelected] = useState<Date | null>(todayInPST);
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    moment().tz("America/Los_Angeles").startOf("month")
  );
  const [displayDate, setDisplayDate] = useState<string>("");
  const [matchingEvents, setMatchingEvents] = useState<MbscCalendarMarked[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true); // Single loading state for entire page

  // Determine which organization ID to use
  const activeOrgId = organizationId || (orgLoaded ? organization?.id : "");
  const displayName = companyName || (orgLoaded ? organization?.name : "");

  useEffect(() => {
    if (!activeOrgId) return;
    const today = moment().tz("America/Los_Angeles");
    setDisplayDate(today.format("dddd, MMM DD, YYYY"));
  }, [activeOrgId]);

  // Fetch events with loading state
  // const eventsResponse = useQuery(api.events.getEventsByOrgAndMonth, {
  //   clerkOrganizationId: activeOrgId || "",
  //   year: displayedMonth.year(),
  //   month: displayedMonth.month() + 1,
  // });

  const eventsResponse = useQuery(api.events.getEventsByNameAndMonth, {
    organizationName: cleanCompanyName,
    year: displayedMonth.year(),
    month: displayedMonth.month() + 1,
  });

  // Handle loading state update when events are fetched
  useEffect(() => {
    if (eventsResponse) {
      setLoading(false); // Set loading to false when events are loaded
    }
  }, [eventsResponse]);

  const myMarked = useMemo<MbscCalendarMarked[]>(() => {
    if (!eventsResponse?.data) return [];
    return eventsResponse?.data.eventData.map((event: EventSchema) => {
      const pstDate = moment(event.startTime).tz("America/Los_Angeles");
      return {
        date: pstDate.format("YYYY-MM-DD"),
        color: "#ff0000",
        event: event,
      };
    });
  }, [eventsResponse]);

  const result = useQuery(
    api.customers.getCustomerSubscriptionTier,
    activeOrgId ? { clerkOrganizationId: activeOrgId } : "skip"
  );

  const uniqueDatesSet = new Set(myMarked.map((item) => item.date));
  const uniqueDates = Array.from(uniqueDatesSet).map((date) => ({
    date,
    color: "#324E78",
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
    const formattedDate = pstDate.format("dddd, MMM DD, YYYY");
    const selectedDateIn = pstDate.format("YYYY-MM-DD");
    setDisplayDate(formattedDate);
    setSelected(pstDate.toDate());
    const matchingEvents: MbscCalendarMarked[] = myMarked.filter(
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
  const showEventStats =
    role === UserRoleEnum.PROMOTER_ADMIN ||
    role === UserRoleEnum.PROMOTER_MANAGER;

  console.log("eventResponse", eventsResponse);
  return (
    <div className="flex flex-col justify-center max-w-3xl md:p-0 pt-4 rounded-lg mx-auto mt-1.5 px-4 md:px-0">
      <div className="flex justify-between mb-6 items-center ">
        <h1 className="font-bold text-3xl ">Events</h1>
        <Protect condition={(has) => has({ permission: "org:events:create" })}>
          <Link href="/add-event">
            <p className="font-semibold  hover:cursor-pointer text-customDarkBlue">
              Add
            </p>
            {/* <PiPlusCircle className="text-4xl" /> */}
          </Link>
        </Protect>
      </div>

      {loading || !result || isClerkLoading ? (
        <CalendarLoading />
      ) : (
        <>
          {isPlusTier && showEventStats && (
            <div></div>
            // <EventStats
            //   nextResetDate={result.nextCycle || ""}
            //   numberOfEvents={result.guestListEventCount}
            // />
          )}
          <Page className="max-w-[820px] h-[420px] rounded-md">
            {/* <div className="font-medium flex rounded items-center justify-center md:justify-start bg-customDarkBlue text-white text-xl font-raleway p-4 border-b border-black">
              {displayDate}
            </div> */}
            <div className="-mt-4 mbsc-col-sm-12 mbsc-col-md-4 max-w-[800px]">
              <div className="mbsc-form-group rounded-md">
                {/* <div className="mbsc-form-group-title">
                    {displayName} Events
                  </div> */}

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
          <div className="mt-8 ">
            <div className="events-list mt-4">
              <h3 className="font-bold text-2xl md:text-3xl mb-4 font-playfair">
                {displayDate} Events:
              </h3>
              {matchingEvents.length > 0 ? (
                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-8">
                  {matchingEvents.map((event: MbscCalendarMarked) => {
                    return <EventPreview eventData={event.event} />;
                  })}
                </div>
              ) : (
                <p>No events for the selected date.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarComponent;
