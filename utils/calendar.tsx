import { TIME_ZONE } from "@/types/constants";
import { EventWithExtras } from "@/types/convex-types";
import { EventSchema } from "@/types/schemas-types";
import { CalendarValue } from "@/types/types";
import { DateTime, Interval } from "luxon";

export const formatShortWeekday = (
  locale: string | undefined,
  date: Date
): string => {
  return date.toLocaleDateString(locale || "en-US", { weekday: "narrow" });
};

export const getShortWeekdayFormatter = (isMobile: boolean) => {
  return (locale: string | undefined, date: Date): string => {
    const resolvedLocale = locale ?? "en-US"; // fallback to a default locale
    const weekday = date.toLocaleDateString(resolvedLocale, {
      weekday: "short",
    });
    return isMobile ? weekday[0] : weekday;
  };
};

export function getVisibleRange(date: Date, isWeekView: boolean) {
  const dt = DateTime.fromJSDate(date).setZone(TIME_ZONE);
  return isWeekView
    ? {
        start: dt.startOf("week").startOf("day"),
        end: dt.endOf("week").endOf("day"),
      }
    : {
        start: dt.startOf("month").startOf("day"),
        end: dt.endOf("month").endOf("day"),
      };
}

/**
 * Returns events that overlap the [start, end] range.
 * Supports all-day & multi-day (if `endTime` exists); otherwise uses startTime.
 */
export function getEventsForDateRange(
  events: EventWithExtras[],
  start: Date,
  end: Date
): EventWithExtras[] {
  const rangeStart = DateTime.fromJSDate(start)
    .setZone(TIME_ZONE)
    .startOf("day");
  const rangeEnd = DateTime.fromJSDate(end).setZone(TIME_ZONE).endOf("day");
  const range = Interval.fromDateTimes(rangeStart, rangeEnd);

  return events.filter((event) => {
    const evStart = DateTime.fromMillis(event.startTime).setZone(TIME_ZONE);
    const evEnd =
      event.endTime != null
        ? DateTime.fromMillis(event.endTime).setZone(TIME_ZONE)
        : evStart;
    const evInterval = Interval.fromDateTimes(evStart, evEnd);
    return evInterval.overlaps(range);
  });
}

// to be deleted
export function getEventsForDate(
  events: EventWithExtras[],
  targetDate: Date
): EventWithExtras[] {
  const selectedDate = DateTime.fromJSDate(targetDate).setZone(TIME_ZONE);

  return events.filter((event) => {
    const eventStartTime = DateTime.fromMillis(event.startTime).setZone(
      TIME_ZONE
    );
    return eventStartTime.hasSame(selectedDate, "day");
  });
}

export function doesDateHaveEvent(events: EventSchema[], date: Date): boolean {
  const selectedDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);

  return events.some((event) => {
    const eventDate = DateTime.fromMillis(event.startTime).setZone(TIME_ZONE);
    return eventDate.hasSame(selectedDate, "day");
  });
}

export function navigateDate(
  date: Date,
  direction: "prev" | "next",
  isWeekView: boolean
): Date {
  const d = DateTime.fromJSDate(date).setZone(TIME_ZONE);
  const delta = direction === "next" ? 1 : -1;
  const next = isWeekView
    ? d.plus({ weeks: delta }).startOf("week")
    : d.plus({ months: delta }).startOf("month");
  return next.toJSDate();
}
export function normalizeCalendarDate(value: CalendarValue): Date {
  if (!value) {
    return DateTime.now().setZone(TIME_ZONE).toJSDate();
  }

  if (Array.isArray(value)) {
    const [firstDate] = value;
    return firstDate
      ? DateTime.fromJSDate(firstDate).setZone(TIME_ZONE).toJSDate()
      : DateTime.now().setZone(TIME_ZONE).toJSDate();
  }

  return DateTime.fromJSDate(value).setZone(TIME_ZONE).toJSDate();
}
