export const formatShortWeekday = (
  locale: string | undefined,
  date: Date
): string => {
  return date.toLocaleDateString(locale || "en-US", { weekday: "narrow" });
};
