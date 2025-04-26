import { TicketInfoSchema } from "@/types/schemas-types";
import { OrganizationSchema } from "@/types/types";
import { Id } from "../../../../../convex/_generated/dataModel";
import { PiNewspaper } from "react-icons/pi";
import { isPast } from "../../../../../utils/luxon";
import { ClerkPermissions } from "@/types/enums";
import ModeratorTicketsPage from "../../events/tickets/ModeratorTicketsPage";
import PromoterTicketsPage from "../../events/tickets/PromoterTicketsPage";
import ManagerTicketsPage from "../../events/tickets/ManagerTicketsPage";

interface TicketInfoTabProps {
  ticketData?: TicketInfoSchema | null;
  canViewAllTickets?: boolean;
  eventId: Id<"events">;
  has: any;
  organization: OrganizationSchema;
}

const TicketTab: React.FC<TicketInfoTabProps> = ({
  ticketData,
  eventId,
  has,
  organization,
}) => {
  const isPromoter = has({ permission: ClerkPermissions.UPLOAD_GUESTLIST });
  const canViewAllTickets = has({
    permission: ClerkPermissions.VIEW_ALL_GUESTLISTS,
  });
  const canCheckInGuests: boolean = has({
    permission: ClerkPermissions.CHECK_GUESTS,
  });

  if (!ticketData) {
    return (
      <div className="mb-4 flex flex-col gap-4 bg-gray-100 min-h-[100vh]">
        <div className=" bg-white w-[95%] mx-auto px-4 pt-4 mt-4 rounded-md mb-4 shadow-md">
          <h1 className="text-2xl font-bold pb-3">Ticket Info</h1>
          <div className="flex items-center  space-x-3 py-3 ">
            <PiNewspaper className="text-2xl" />
            <p>There is no ticket option for this event</p>
          </div>
        </div>
      </div>
    );
  }
  const isTicketsSalesOpen = !isPast(ticketData.ticketSalesEndTime);

  if (isPromoter) {
    return <PromoterTicketsPage eventId={eventId} />;
  }
  if (canCheckInGuests) {
    return <ModeratorTicketsPage eventId={eventId} />;
  }
  if (canViewAllTickets) {
    return (
      <ManagerTicketsPage
        eventId={eventId}
        organizationId={organization._id}
        isTicketsSalesOpen={isTicketsSalesOpen}
        ticketData={ticketData}
      />
    );
  }

  return <div>TicketTab</div>;
};

export default TicketTab;
