import { TIME_ZONE } from "@/shared/types/constants";
import { EventWithExtras } from "@/shared/types/convex-types";
import { CalendarValue } from "@/shared/types/types";
import { Doc } from "convex/_generated/dataModel";
import { DateTime } from "luxon";

export const formatShortWeekday = (
  locale: string | undefined,
  date: Date
): string => {
  return date.toLocaleDateString(locale || "en-US", { weekday: "narrow" });
};

export const getShortWeekdayFormatter = (isMobile: boolean) => {
  return (locale: string | undefined, date: Date): string => {
    const resolvedLocale = locale ?? "en-US";
    const weekday = date.toLocaleDateString(resolvedLocale, {
      weekday: "short",
    });
    return isMobile ? weekday[0] : weekday;
  };
};

export function getVisibleRange(date: Date, isWeekView: boolean) {
  const dt = DateTime.fromJSDate(date).setZone(TIME_ZONE);

  if (isWeekView) {
    const sunday = dt.minus({ days: dt.weekday % 7 }).startOf("day");
    const saturdayEnd = sunday.plus({ days: 6 }).endOf("day");
    return { start: sunday, end: saturdayEnd };
  }

  return {
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
  startMs: number, // millis
  endMs: number // millis
): EventWithExtras[] {
  const rangeStartMs = DateTime.fromMillis(startMs)
    .setZone(TIME_ZONE)
    .startOf("day")
    .toMillis();
  const rangeEndMs = DateTime.fromMillis(endMs)
    .setZone(TIME_ZONE)
    .endOf("day")
    .toMillis();

  return events.filter((ev) => {
    const evStartMs = DateTime.fromMillis(ev.startTime)
      .setZone(TIME_ZONE)
      .toMillis();
    return evStartMs >= rangeStartMs && evStartMs <= rangeEndMs;
  });
}

export function doesDateHaveEvent(
  events: Doc<"events">[],
  date: Date
): boolean {
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
