import moment from "moment";

export const formatShortDate = (date: Date) => {
  return moment(date).format("MMM D, YYYY"); // Example: Dec 30, 24
};

export const formatNarrowWeekday = (
  locale: string | undefined,
  date: Date
): string => {
  return moment(date)
    .locale(locale || "en")
    .format("dd")
    .charAt(0); // ✅ Returns "M", "T", "W"
};
