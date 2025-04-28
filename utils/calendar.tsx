import { TIME_ZONE } from "@/types/constants";
import { EventSchema } from "@/types/schemas-types";
import { CalendarValue } from "@/types/types";
import { DateTime } from "luxon";

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

export function getEventsForDate(
  events: EventSchema[],
  targetDate: Date
): EventSchema[] {
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
  currentDate: Date,
  direction: "prev" | "next"
): Date {
  return DateTime.fromJSDate(currentDate)
    .setZone(TIME_ZONE)
    .plus({ days: direction === "next" ? 7 : -7 })
    .toJSDate();
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
