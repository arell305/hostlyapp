import React from "react";
import { cn } from "@/lib/utils";
import { EventSchema } from "@/types/schemas-types";
import { formatEventDateParts } from "@/utils/luxon";
import Link from "next/link";
import NProgress from "nprogress";

interface EventItemProps {
  event: EventSchema;
  className?: string;
  pathname: string;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  className,
  pathname,
}) => {
  const { month, day, time } = formatEventDateParts(event.startTime);

  const hasExtras = event.ticketInfoId || event.guestListInfoId;

  return (
    <Link
      href={`${pathname}/events/${event._id}`}
      onClick={() => NProgress.start()}
      className="w-full"
    >
      <div
        className={cn(
          "relative flex  border cursor-pointer rounded-md  transition-shadow duration-200 hover:shadow-glow-white",
          className
        )}
      >
        {hasExtras && (
          <div className="absolute top-2 right-2 bg-cardBackgroundHover text-white text-xs px-2 py-1 rounded font-semibold shadow">
            {event.ticketInfoId && event.guestListInfoId
              ? "Tickets + Guest List"
              : event.ticketInfoId
                ? "Tickets"
                : "Guest List"}
          </div>
        )}

        <div className="space-x-6 flex">
          <div className="bg-cardBackgroundHover px-2 py-1 rounded text-center w-20 flex flex-col items-center justify-center">
            <div className="text-sm font-semibold text-muted-foreground">
              {month}
            </div>
            <div className="font-bold text-lg">{day}</div>
          </div>

          <div className="flex flex-col py-2">
            <div className="font-medium text-2xl text-white">{event.name}</div>
            <div className="text-sm text-grayText">{time}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventItem;
