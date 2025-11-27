import { PresetOption, TIME_ZONE } from "@/shared/types/constants";
import { DateTime, Zone } from "luxon";
import { DateRange } from "react-day-picker";

export const formatTime = (timestamp: number): string => {
  return DateTime.fromMillis(timestamp, { zone: TIME_ZONE }).toFormat("h:mm a");
};

export const formatDateMDY = (timestamp: number): string => {
  return DateTime.fromMillis(timestamp)
    .setZone(TIME_ZONE)
    .toFormat("MMMM d, yyyy");
};

export const convertToPstTimestamp = (dateTimeString: string): number => {
  return DateTime.fromFormat(dateTimeString, "yyyy-MM-dd'T'HH:mm", {
    zone: TIME_ZONE,
    setZone: true,
  }).toMillis();
};

export const timestampToPstString = (timestamp: number | null) => {
  if (!timestamp) return "";
  return DateTime.fromMillis(timestamp, {
    zone: TIME_ZONE,
  }).toFormat("yyyy-MM-dd'T'HH:mm");
};

export const convertToPST = (date: Date): Date => {
  return DateTime.fromJSDate(date).setZone(TIME_ZONE).toJSDate();
};

export const getCurrentTime = (): number => {
  const now = DateTime.now().setZone(TIME_ZONE);
  return now.toMillis();
};
export const getCurrentDate = (): Date => {
  return DateTime.now().setZone(TIME_ZONE).toJSDate();
};

export const isTodayInPST = (date: Date): boolean => {
  const providedDateInPST = DateTime.fromJSDate(date).setZone(TIME_ZONE);

  const nowInPST = DateTime.now().setZone(TIME_ZONE);

  return (
    providedDateInPST.year === nowInPST.year &&
    providedDateInPST.month === nowInPST.month &&
    providedDateInPST.day === nowInPST.day
  );
};

interface DateTimeOptions {
  zone?: string | Zone<boolean> | undefined;
  locale?: string;
}

export const formatNarrowWeekday = (
  locale: string | undefined,
  date: Date
): string => {
  const dt = DateTime.fromJSDate(date, {
    locale: locale || "en",
  } as DateTimeOptions);

  const shortWeekday = dt.toLocaleString({ weekday: "short" });

  return shortWeekday.charAt(0);
};

export const formatShortDate = (date: Date): string => {
  const dt = DateTime.fromJSDate(date);
  return dt.toLocaleString({ month: "short", day: "numeric" });
};

export const formatLongDate = (date: Date): string => {
  const dt = DateTime.fromJSDate(date);
  return dt.toLocaleString({ month: "long", day: "numeric", year: "numeric" });
};

export const formatToTimeAndShortDate = (timestamp: number): string => {
  return DateTime.fromMillis(timestamp)
    .setZone(TIME_ZONE)
    .toFormat("MMM d, yyyy h:mma");
};

export const isPast = (timestamp: number): boolean => {
  return DateTime.now().toMillis() > timestamp;
};

export const formatArrivalTime = (timestamp: number) => {
  return DateTime.fromMillis(timestamp).setZone(TIME_ZONE).toFormat("h:mma");
};

export const formatUnixToTimeAndAbbreviatedDate = (
  timestamp: number
): string => {
  return DateTime.fromMillis(timestamp)
    .setZone(TIME_ZONE)
    .toFormat("M/d/yy h:mma");
};

export const isAfterNowInPacificTime = (timestamp: number): boolean => {
  const targetTime = DateTime.fromMillis(timestamp).setZone(TIME_ZONE);
  const now = DateTime.now().setZone(TIME_ZONE);

  return targetTime > now;
};

export const getDateRangeFromPreset = (preset: PresetOption): DateRange => {
  const now = DateTime.now().setZone(TIME_ZONE);

  switch (preset) {
    case "Last 7 Days":
      return {
        from: now.minus({ days: 6 }).startOf("day").toJSDate(),
        to: now.endOf("day").toJSDate(),
      };
    case "Last 30 Days":
      return {
        from: now.minus({ days: 29 }).startOf("day").toJSDate(),
        to: now.endOf("day").toJSDate(),
      };
    case "This Month":
      return {
        from: now.startOf("month").startOf("day").toJSDate(),
        to: now.endOf("day").toJSDate(),
      };
    case "Last Month": {
      const lastMonth = now.minus({ months: 1 });
      return {
        from: lastMonth.startOf("month").startOf("day").toJSDate(),
        to: lastMonth.endOf("month").endOf("day").toJSDate(),
      };
    }
    default:
      return {
        from: undefined,
        to: undefined,
      };
  }
};

export function formatEventDateParts(startTime: number) {
  const date = DateTime.fromMillis(startTime, { zone: TIME_ZONE });

  return {
    month: date.toFormat("MMM").toUpperCase(),
    day: date.toFormat("d"),
    time: date.toFormat("h:mm a"),
  };
}

export function formatToEventDateTime(timestamp: number): string {
  return DateTime.fromMillis(timestamp, { zone: TIME_ZONE }).toFormat(
    "EEE, MMM d • h:mm a"
  );
}

export function formatToPstShortDate(ts: number): string {
  return DateTime.fromMillis(ts, { zone: TIME_ZONE }).toFormat("M/d/yy");
}

// Returns a Luxon DateTime at start of day PST
export function startOfPstDay(ts: number): DateTime {
  return DateTime.fromMillis(ts, { zone: TIME_ZONE }).startOf("day");
}

// export function formatToDateTimeLocalPST(ms: number | null): string {
//   return ms
//     ? DateTime.fromMillis(ms).setZone(TIME_ZONE).toFormat("yyyy-MM-dd'T'HH:mm")
//     : "";
// }

// export function parseDateTimeLocalToTimestampPST(val: string): number | null {
//   return val ? DateTime.fromISO(val, { zone: TIME_ZONE }).toMillis() : null;
// }

// utils/timePST.ts
// import { DateTime } from "luxon";

// export const TIME_ZONE = "America/Los_Angeles";
const INPUT_FMT = "yyyy-LL-dd'T'HH:mm";

/** ms (UTC or any zone) -> "YYYY-MM-DDTHH:mm" string rendered in PST/PDT */
export function formatToDateTimeLocalPST(ms: number | null): string {
  if (ms == null) return "";
  return DateTime.fromMillis(ms).setZone(TIME_ZONE).toFormat(INPUT_FMT);
}

/** "YYYY-MM-DDTHH:mm" string (from input) interpreted AS PST/PDT -> ms epoch */
export function parseDateTimeLocalToTimestampPST(val: string): number | null {
  if (!val) return null;
  const dt = DateTime.fromFormat(val, INPUT_FMT, { zone: TIME_ZONE });
  return dt.isValid ? dt.toMillis() : null;
}

export const formatDisplayDateTime = (
  timestamp: number | null | undefined
): string => {
  if (!timestamp) return "—";

  return DateTime.fromMillis(timestamp)
    .setZone(TIME_ZONE)
    .toFormat("h:mma · MMM d, yyyy");
};

export const formatDateTime = (timestamp: number) =>
  DateTime.fromMillis(timestamp)
    .setZone(TIME_ZONE)
    .toFormat(" MMM d, yyyy h:mma");

export const formatShortDateTime = (timestamp: number) =>
  DateTime.fromMillis(timestamp).setZone(TIME_ZONE).toFormat("MM/dd/yy h:mma");

export function formatRelativeTimestamp(rawTimestamp?: number | null): string {
  if (!rawTimestamp) {
    return "";
  }

  const timestampInMilliseconds =
    rawTimestamp > 1e12 ? rawTimestamp : rawTimestamp * 1000;

  const dateTime = DateTime.fromMillis(timestampInMilliseconds);

  if (!dateTime.isValid) {
    return "";
  }

  return dateTime.toRelative() ?? "";
}

export const getDefaultScheduledTime = (): number => {
  const now = DateTime.now().setZone(TIME_ZONE);
  const minutes = now.minute;
  const minutesToNext15 = 15 - (minutes % 15);
  const rounded = now.plus({ minutes: minutesToNext15 }).startOf("minute");
  return rounded.toMillis();
};
