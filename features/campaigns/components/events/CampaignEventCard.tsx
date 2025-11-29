"use client";

import { cn } from "@/shared/lib/utils";
import { formatEventDateParts } from "@/shared/utils/luxon";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { EventWithExtras } from "@/shared/types/convex-types";

interface EventItemProps {
  event: EventWithExtras;
  className?: string;
  onSelect: (eventId: Id<"events">) => void;
  isSelected: boolean;
}

const EventItem: React.FC<EventItemProps> = ({
  isSelected,
  className,
  event,
  onSelect,
}) => {
  const { month, day, time } = formatEventDateParts(event.startTime);
  const hasExtras = event.ticketTypes.length > 0 || !!event.guestListInfo;

  return (
    <button
      className={cn(
        "relative flex border cursor-pointer rounded-md transition-shadow duration-200 hover:shadow-glow-white w-full",
        isSelected ? "shadow-glow-primary" : "",
        className
      )}
      onClick={() => onSelect(event._id)}
    >
      {hasExtras && (
        <div className="absolute top-2 right-2 bg-cardBackgroundHover text-white text-xs px-2 py-1 rounded font-semibold shadow z-10">
          {event.ticketTypes.length > 0 && event.guestListInfo
            ? "Tickets + Guest List"
            : event.ticketTypes.length > 0
              ? "Tickets"
              : "Guest List"}
        </div>
      )}

      <div className="bg-cardBackgroundHover px-2 py-1 rounded text-center w-20 flex flex-col items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground">
          {month}
        </div>
        <div className="font-bold text-lg">{day}</div>
      </div>

      <div className="flex-1 pl-4 pr-10 py-2 text-left flex flex-col justify-center">
        <div className="font-medium text-lg text-white">{event.name}</div>
        <div className="text-sm text-grayText">{time}</div>
      </div>
    </button>
  );
};

export default EventItem;
