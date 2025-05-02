import { PresetOption, TIME_ZONE } from "@/types/constants";
import { DateTime, Zone } from "luxon";
import { DateRange } from "react-day-picker";

export const formatTime = (timestamp: number): string => {
  const pstDateTime = DateTime.fromMillis(timestamp, {
    zone: "America/Los_Angeles",
  });

  return pstDateTime.toFormat("h:mm a");
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
  return dt.toLocaleString({ month: "short", day: "numeric", year: "numeric" });
};

export const formatLongDate = (date: Date): string => {
  const dt = DateTime.fromJSDate(date);
  return dt.toLocaleString({ month: "long", day: "numeric", year: "numeric" });
};

export const formatToTimeAndShortDate = (timestamp: number): string => {
  return DateTime.fromMillis(timestamp)
    .setZone("America/Los_Angeles")
    .toFormat("MMM d, yyyy h:mma");
};

export const isPast = (timestamp: number): boolean => {
  return DateTime.now().toMillis() > timestamp;
};

export const formatArrivalTime = (timestamp: number) => {
  return DateTime.fromMillis(timestamp).toFormat("h:mma");
};

export const formatUnixToTimeAndAbbreviatedDate = (
  timestamp: number
): string => {
  return DateTime.fromMillis(timestamp)
    .setZone("America/Los_Angeles")
    .toFormat("M/d/yy h:mma");
};

export const isAfterNowInPacificTime = (timestamp: number): boolean => {
  const targetTime = DateTime.fromMillis(timestamp).setZone(
    "America/Los_Angeles"
  );
  const now = DateTime.now().setZone("America/Los_Angeles");

  return targetTime > now;
};

export const getDateRangeFromPreset = (preset: PresetOption): DateRange => {
  const now = DateTime.now().setZone("America/Los_Angeles");

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
  const date = DateTime.fromMillis(startTime);

  return {
    month: date.toFormat("MMM").toUpperCase(),
    day: date.toFormat("d"),
    time: date.toFormat("h:mm a"),
  };
}
