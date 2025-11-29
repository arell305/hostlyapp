"use client";

import DetailsView from "@/features/customerEvents/components/view/DetailsView";
import EmptyStateCard from "@/features/events/components/EmptyStateCard";
import GuestListTimeCard from "@/features/events/components/GuestListTimeCard";
import TicketTimeCard from "@/features/events/components/TicketTimeCard";
import { useEventContext } from "@/shared/hooks/contexts";
import SubPageContainer from "@/shared/ui/containers/SubPageContainer";
import { formatToTimeAndShortDate, isPast } from "@/shared/utils/luxon";
import { LuClipboardList } from "react-icons/lu";

const CampaignEventDetails = () => {
  const { event, guestListInfo, ticketTypes } = useEventContext();

  const isCheckInOpen = guestListInfo
    ? !isPast(guestListInfo.checkInCloseTime)
    : false;

  const isGuestListOpen = guestListInfo
    ? !isPast(guestListInfo.guestListCloseTime)
    : false;

  const canEditEvent = false;
  const isPromoter = false;

  return (
    <SubPageContainer className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1 font-medium">Event Details</h2>

        <DetailsView eventData={event} className="w-full" />
      </div>
      <div>
        <h2 className="mb-1 font-medium">Guest List</h2>
        {guestListInfo ? (
          <GuestListTimeCard
            guestListRules={guestListInfo.guestListRules}
            isCheckInOpen={isCheckInOpen}
            isGuestListOpen={isGuestListOpen}
            guestListCloseTime={formatToTimeAndShortDate(
              guestListInfo.guestListCloseTime
            )}
            formattedCheckInEndTime={formatToTimeAndShortDate(
              guestListInfo.checkInCloseTime
            )}
            eventId={event._id}
          />
        ) : (
          <EmptyStateCard
            message="There is no guest list option for this event."
            icon={<LuClipboardList className="text-2xl" />}
          />
        )}
      </div>
      <div>
        {ticketTypes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {ticketTypes.map((ticketType) => (
              <TicketTimeCard
                key={ticketType._id}
                ticketTotals={null}
                ticketInfo={[ticketType]}
                canEditEvent={canEditEvent}
                isPromoter={isPromoter}
                hideTicketsSold={true}
              />
            ))}
          </div>
        ) : (
          <div>
            <h2 className="font-medium mb-1">Tickets</h2>
            <EmptyStateCard
              message="There is no ticket option for this event."
              icon={<LuClipboardList className="text-2xl" />}
            />
          </div>
        )}
      </div>
    </SubPageContainer>
  );
};

export default CampaignEventDetails;
