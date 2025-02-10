export const formatShortWeekday = (
  locale: string | undefined,
  date: Date
): string => {
  return date.toLocaleDateString(locale || "en-US", { weekday: "narrow" });
};

// export const tileClassName = ({ date, view }: { date: Date; view: string }) => {
//   // const currentDate = new Date();
//   // const nextMonth = new Date(
//   //   currentDate.getFullYear(),
//   //   currentDate.getMonth() + 1,
//   //   1
//   // );
//   // // Check if the date is in the next month
//   // if (
//   //   view === "month" &&
//   //   date >= nextMonth &&
//   //   date < new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1)
//   // ) {
//   //   return "text-gray-400"; // Tailwind class for light gray text
//   // }
//   // return "bg-transparent focus:outline-none focus:ring-0 active:bg-transparent  md:hover-gray-100 has-event"; // Default class
// };
