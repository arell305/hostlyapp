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
