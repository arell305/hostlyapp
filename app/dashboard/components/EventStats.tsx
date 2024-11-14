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
  if (numberOfEvents !== undefined) {
    return (
      <div className="mb-4">
        <h2>Event Summary</h2>
        <div className="summary-item">
          <strong>Remaining Guest List Events:</strong> {3 - numberOfEvents}
        </div>
        <div className="summary-item">
          <strong>Next Reset Date:</strong> {formatDate(nextResetDate)}
        </div>
      </div>
    );
  }
};

export default EventSummary;
