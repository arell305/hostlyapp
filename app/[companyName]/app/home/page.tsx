"use client";
import { Protect, useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import moment from "moment-timezone";
import { MbscCalendarMarked } from "@mobiscroll/react";
import { EventSchema } from "@/types/types";
import { SubscriptionTier, UserRoleEnum } from "../../../../utils/enum";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CiCirclePlus } from "react-icons/ci";

const page = () => {
  const todayInPST = moment().tz("America/Los_Angeles").startOf("day").toDate();

  const { companyName } = useParams();
  const [displayDate, setDisplayDate] = useState<string>("");
  const [matchingEvents, setMatchingEvents] = useState<MbscCalendarMarked[]>(
    []
  );
  const [selected, setSelected] = useState<Date | null>(todayInPST);

  const cleanCompanyName =
    typeof companyName === "string"
      ? companyName.split("?")[0].toLowerCase()
      : "";

  const [displayedMonth, setDisplayedMonth] = useState(() =>
    moment().tz("America/Los_Angeles").startOf("month")
  );

  const organizationData = useQuery(
    api.organizations.getOrganizationByNameQuery,
    cleanCompanyName ? { name: cleanCompanyName } : "skip"
  );

  const eventsResponse = useQuery(api.events.getEventsByNameAndMonth, {
    organizationName: cleanCompanyName,
    year: displayedMonth.year(),
    month: displayedMonth.month() + 1,
  });

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

  //   const result = useQuery(
  //     api.customers.getCustomerSubscriptionTier,
  //     organizationData?.data?.organization._id
  //       ? { clerkOrganizationId: organizationData?.data?.organization._id || "" }
  //       : "skip"
  //   );

  const uniqueDatesSet = new Set(myMarked.map((item) => item.date));
  const uniqueDates = Array.from(uniqueDatesSet).map((date) => ({
    date,
    color: "#324E78",
  }));

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

  if (organizationData === undefined) {
    return <p>Loading</p>;
  }

  console.log("event response", eventsResponse);
  return (
    <div className="justify-center  max-w-3xl  mx-auto mt-1.5 md:min-h-[300px]">
      <div className="flex justify-between items-center w-full px-4 pt-4 md:pt-0 mb-4">
        <h1 className="font-bold text-3xl">Events</h1>
        <Protect condition={(has) => has({ permission: "org:events:create" })}>
          <Link
            href={`/${cleanCompanyName}/app/add-event`}
            className="flex items-center"
          >
            <Button variant="ghost">Add Event</Button>
          </Link>
        </Protect>
      </div>
    </div>
  );
};

export default page;
