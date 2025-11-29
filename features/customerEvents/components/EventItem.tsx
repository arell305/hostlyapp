"use client";

import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { formatEventDateParts } from "@/shared/utils/luxon";
import { EventWithExtras } from "@/shared/types/convex-types";
import { Id } from "@/convex/_generated/dataModel";

interface EventItemProps {
  event: EventWithExtras;
  className?: string;
  onSelect?: (eventId: Id<"events">) => void;
  isSelected?: boolean;
  pathname?: string;
}

const EventItemContent = ({
  event,
  className,
}: {
  event: EventWithExtras;
  className?: string;
}) => {
  const { month, day, time } = formatEventDateParts(event.startTime);
  const hasExtras = event.ticketTypes.length > 0 || !!event.guestListInfo;

  return (
    <div
      className={cn(
        "flex items-stretch border rounded-md transition-shadow duration-200 hover:shadow-glow-white overflow-hidden",
        className
      )}
    >
      <div className="bg-cardBackgroundHover px-3 rounded-l-md flex flex-col items-center justify-center w-20">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {month}
        </div>
        <div className="text-2xl font-bold leading-none mt-1">{day}</div>
      </div>

      <div className="flex-1 min-w-0 pl-4 pr-3 py-3">
        <h3 className="font-medium text-xl text-white truncate">
          {event.name}
        </h3>
        <p className="text-sm text-grayText mt-1">{time}</p>
      </div>

      {hasExtras && (
        <div>
          <div className="bg-cardBackgroundHover text-white text-xs px-2.5 py-1 rounded font-bold shadow-md">
            {event.ticketTypes.length > 0 && event.guestListInfo
              ? "Tickets + Guest List"
              : event.ticketTypes.length > 0
                ? "Tickets"
                : "Guest List"}
          </div>
        </div>
      )}
    </div>
  );
};

const EventItem: React.FC<EventItemProps> = ({
  event,
  className,
  onSelect,
  isSelected,
  pathname,
}) => {
  const content = <EventItemContent event={event} className={className} />;

  if (onSelect) {
    return (
      <button
        onClick={() => onSelect(event._id)}
        className={cn(
          "w-full text-left",
          isSelected && "shadow-glow-primary ring-2 ring-primary/50"
        )}
      >
        {content}
      </button>
    );
  }

  if (pathname) {
    return (
      <Link href={`${pathname}/events/${event._id}`} className="w-full block">
        {content}
      </Link>
    );
  }

  return content;
};

export default EventItem;
