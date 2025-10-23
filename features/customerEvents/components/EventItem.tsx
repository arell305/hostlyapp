"use client";

import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import NProgress from "nprogress";
import { formatEventDateParts } from "@/shared/utils/luxon";
import { EventWithExtras } from "@/shared/types/convex-types";

interface EventItemProps {
  event: EventWithExtras;
  className?: string;
  pathname: string;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  className,
  pathname,
}) => {
  const { month, day, time } = formatEventDateParts(event.startTime);

  const hasExtras = event.ticketTypes.length > 0 || !!event.guestListInfo;

  return (
    <Link
      href={`${pathname}/events/${event._id}`}
      onClick={() => NProgress.start()}
      className="w-full"
    >
      <div
        className={cn(
          "relative flex border cursor-pointer rounded-md transition-shadow duration-200 hover:shadow-glow-white",
          className
        )}
      >
        {hasExtras && (
          <div className="absolute top-2 right-2 bg-cardBackgroundHover text-white text-xs px-2 py-1 rounded font-semibold shadow">
            {event.ticketTypes.length > 0 && event.guestListInfo
              ? "Tickets + Guest List"
              : event.ticketTypes.length > 0
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
