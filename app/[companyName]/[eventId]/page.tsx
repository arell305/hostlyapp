"use client";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React from "react";
import { api } from "../../../convex/_generated/api";
import EventInfoSkeleton from "../app/components/loading/EventInfoSkeleton";
import { ResponseStatus } from "../../../utils/enum";
import NotFound from "../app/components/errors/NotFound";
import DetailsView from "../app/components/view/DetailsView";
import About from "../app/components/view/About";
import TicketView from "../app/components/view/Tickets";

const page = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  if (getEventByIdResponse === undefined) {
    return <EventInfoSkeleton />;
  }

  if (getEventByIdResponse.status === ResponseStatus.ERROR) {
    return <NotFound text={"event"} />; // Or handle it in another way
  }

  return (
    <div className="flex flex-col justify-center items-center space-y-4 bg-gray-100 pb-4 pt-4 min-h-[100vh]">
      <DetailsView eventData={getEventByIdResponse.data.event} />
      <About description={getEventByIdResponse.data.event.description} />
      <TicketView ticketData={getEventByIdResponse.data.ticketInfo} />
    </div>
  );
};

export default page;
