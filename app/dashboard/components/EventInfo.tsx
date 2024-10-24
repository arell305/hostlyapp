import { formatDateTime, utcToPstString } from "../../../utils/helpers";

interface EventInfoProps {
  event: {
    name: string;
    startTime: string;
    endTime: string;
    description?: string | null;
    photo?: string | null;
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
  guestListInfo: {
    guestListCloseTime: string;
  } | null;
}

const EventInfo: React.FC<EventInfoProps> = ({
  event,
  ticketInfo,
  canEdit,
  guestListInfo,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Event Information</h2>
        <p className="mb-2">
          <strong>Starts:</strong> {formatDateTime(event.startTime)}
        </p>
        {event.endTime && (
          <p className="mb-2">
            <strong>Ends:</strong> {formatDateTime(event.endTime)}
          </p>
        )}
        {event.description && (
          <p className="mb-2">
            <strong>Description:</strong> {event.description}
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

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Ticket Information</h2>
        {ticketInfo ? (
          <div>
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
              <strong>Ticket Sales Close:</strong>{" "}
              {formatDateTime(ticketInfo.ticketSalesEndTime)}
            </p>
          </div>
        ) : (
          <p>No ticket option for this event.</p>
        )}
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Guest List Information</h2>
        {guestListInfo ? (
          <p className="mb-2">
            <strong>Guest List Closes:</strong>{" "}
            {formatDateTime(guestListInfo.guestListCloseTime)}
          </p>
        ) : (
          <p>No guest list option for this event.</p>
        )}
      </div>
    </div>
  );
};

export default EventInfo;
