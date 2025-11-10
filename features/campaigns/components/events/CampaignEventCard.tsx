"use client";

import { cn } from "@/shared/lib/utils";
import { formatEventDateParts } from "@/shared/utils/luxon";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface EventItemProps {
  event: Doc<"events">;
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

  return (
    <button
      className={cn(
        "relative flex border cursor-pointer rounded-md transition-shadow duration-200 hover:shadow-glow-white",
        isSelected ? "shadow-glow-primary" : "",
        className
      )}
      onClick={() => onSelect(event._id)}
    >
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
    </button>
  );
};

export default EventItem;
