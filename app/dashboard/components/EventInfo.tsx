import { formatArrivalTime } from "../../../utils/helpers";

interface EventInfoProps {
  event: {
    name: string;
    date: string;
    startTime: string;
    endTime?: string | null;
    description?: string | null;
    photo?: string | null;
    guestListCloseTime?: string | null;
  };
  ticketInfo: {
    maleTicketPrice: number;
    femaleTicketPrice: number;
    maleTicketCapacity: number;
    femaleTicketCapacity: number;
    ticketSalesEndTime: string;
    totalMaleTicketsSold: number;
    totalFemaleTicketsSold: number;
  } | null;
  canEdit: boolean;
}

const EventInfo: React.FC<EventInfoProps> = ({
  event,
  ticketInfo,
  canEdit,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Event Information</h2>
        <p className="mb-2">
          <strong>Date:</strong> {event.date}
        </p>
        <p className="mb-2">
          <strong>Start Time:</strong> {event.startTime}
        </p>
        {event.endTime && (
          <p className="mb-2">
            <strong>End Time:</strong> {event.endTime}
          </p>
        )}
        {event.description && (
          <p className="mb-2">
            <strong>Description:</strong> {event.description}
          </p>
        )}
        {event.guestListCloseTime && (
          <p className="mb-2">
            <strong>Guest List Closes:</strong> {event.guestListCloseTime}
          </p>
        )}
        {event.photo && (
          <img
            src={event.photo}
            alt={event.name}
            className="w-full h-64 object-cover rounded-lg mt-4"
          />
        )}
      </div>

      {ticketInfo && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Ticket Information</h2>
          <p className="mb-2">
            <strong>Male Ticket Price:</strong> $
            {ticketInfo.maleTicketPrice.toFixed(2)}
          </p>
          <p className="mb-2">
            <strong>Female Ticket Price:</strong> $
            {ticketInfo.femaleTicketPrice.toFixed(2)}
          </p>
          <p className="mb-2">
            <strong>Male Ticket Capacity:</strong>{" "}
            {ticketInfo.maleTicketCapacity}
          </p>
          <p className="mb-2">
            <strong>Female Ticket Capacity:</strong>{" "}
            {ticketInfo.femaleTicketCapacity}
          </p>
          <p className="mb-2">
            <strong>Ticket Sales Close:</strong> {ticketInfo.ticketSalesEndTime}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventInfo;
