import React, { useState, useEffect } from "react";

// Utility function to format the date
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

interface EventSummaryProps {
  nextResetDate: string; // ISO string for the reset date
  numberOfEvents?: number;
}

const EventSummary: React.FC<EventSummaryProps> = ({
  nextResetDate,
  numberOfEvents,
}) => {
  const [currentMonth, setCurrentMonth] = useState<string>("");

  // Calculate the current month
  useEffect(() => {
    const monthName = new Date().toLocaleString("default", { month: "long" });
    setCurrentMonth(monthName);
  }, []);

  if (numberOfEvents) {
    return (
      <div className="event-summary">
        <h2>Event Summary</h2>
        <div className="summary-item">
          <strong>Remaining Guest List Events:</strong> {numberOfEvents - 3}
        </div>
        <div className="summary-item">
          <strong>Next Reset Date:</strong> {formatDate(nextResetDate)}
        </div>
      </div>
    );
  }
};

export default EventSummary;
