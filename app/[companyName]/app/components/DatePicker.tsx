import { DateTime } from "luxon";
import { Datepicker, localeEn } from "@mobiscroll/react";
import "@mobiscroll/react/dist/css/mobiscroll.min.css";

interface DatePickerProps {
  value: number | null; // Timestamp in milliseconds (PST)
  setValue: (value: number) => void; // Function to update value
  error?: string; // Optional error message
}

const MyDatePicker: React.FC<DatePickerProps> = ({
  value,
  setValue,
  error,
}) => {
  // Handle date change, interpreting input as PST
  const handleChange = (newDate: Date) => {
    const pstTimestamp = DateTime.fromJSDate(newDate, {
      zone: "America/Los_Angeles",
    }).toMillis();
    setValue(pstTimestamp);
  };

  return (
    <div className="mb-6 flex flex-col relative px-4">
      <label htmlFor="startTime" className="font-semibold">
        Starts*
      </label>
      <Datepicker
        controls={["calendar", "time"]}
        display="bubble" // or "inline" for always-visible
        dateFormat="YYYY-MM-DD"
        timeFormat="hh:mm A"
        touchUi={true}
        theme="ios" // Options: "ios", "material", "windows"
        value={value ? new Date(value) : null}
        onChange={(event) => handleChange(event.value as Date)}
        locale={localeEn} // Ensures proper format
        timezone="America/Los_Angeles" // Forces PST interpretation
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default MyDatePicker;
