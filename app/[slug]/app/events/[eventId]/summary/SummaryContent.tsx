import {
  EventSchema,
  EventTicketTypesSchema,
  GuestListInfoSchema,
} from "@/types/schemas-types";
import EmptyStateCard from "../../components/EmptyStateCard";
import {
  formatToTimeAndShortDate,
  isPast,
} from "../../../../../../utils/luxon";
import GuestListTimeCard from "../../components/GuestListTimeCard";
import TicketTimeCard from "../../components/TicketTimeCard";
import { LuClipboardList } from "react-icons/lu";
import {
  PromoterGuestStatsData,
  GetTicketSalesByPromoterData,
} from "@/types/convex-types";
import PromoterGuestsListData from "./PromoterGuestsData";
import PromoterTicketData from "./PromoterTicketData";
import { TicketIcon } from "lucide-react";
import SubPageContainer from "@/components/shared/containers/SubPageContainer";
import EventLinkCard from "../../components/EventLinkCard";
import { TicketTotalsItem } from "@/types/types";

interface SummaryContentProps {
  guestListInfo?: GuestListInfoSchema | null;
  isPromoter: boolean;
  ticketInfo?: EventTicketTypesSchema[] | null;
  promoterGuestStats: Omit<PromoterGuestStatsData, "entries">[];
  ticketSalesByPromoterData: {
    tickets: GetTicketSalesByPromoterData["tickets"];
    ticketTotals: TicketTotalsItem[] | null;
  } | null;
  canEditEvent: boolean;
  event: EventSchema;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  isPromoter,
  promoterGuestStats,
  guestListInfo,
  ticketInfo,
  ticketSalesByPromoterData,
  canEditEvent,
  event,
}) => {
  const isGuestListOpen = guestListInfo
    ? !isPast(guestListInfo.guestListCloseTime)
    : false;

  const isCheckInOpen = guestListInfo
    ? !isPast(guestListInfo.checkInCloseTime)
    : false;

  return (
    <SubPageContainer className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1 font-medium">Event Details</h2>
        <EventLinkCard event={event} />
      </div>

      {ticketInfo && ticketSalesByPromoterData && ticketInfo.length > 0 ? (
        <>
          <TicketTimeCard
            ticketTotals={ticketSalesByPromoterData.ticketTotals ?? []}
            ticketInfo={ticketInfo}
            canEditEvent={canEditEvent}
            className=""
            isPromoter={isPromoter}
          />

          {isPromoter && ticketSalesByPromoterData.tickets.length > 0 && (
            <PromoterTicketData
              promoterTicketData={ticketSalesByPromoterData.tickets[0]}
            />
          )}
        </>
      ) : (
        <div>
          <h2 className="font-medium mb-1">Tickets</h2>
          <EmptyStateCard
            message="There is no ticket option for this event."
            icon={<LuClipboardList className="text-2xl" />}
          />
        </div>
      )}

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

      {isPromoter && promoterGuestStats && (
        <div>
          <h2 className="mb-1 font-medium">Promoter Guest Attendance</h2>
          <PromoterGuestsListData guestListData={promoterGuestStats[0]} />
        </div>
      )}

      {ticketInfo && !isPromoter && ticketSalesByPromoterData && (
        <div>
          <h2 className="mb-1 font-medium">Promoter Ticket Sales</h2>
          {ticketSalesByPromoterData.tickets.length > 0 ? (
            <div className="flex flex-col gap-2">
              {ticketSalesByPromoterData.tickets.map((ticket) => (
                <PromoterTicketData
                  promoterTicketData={ticket}
                  key={ticket.promoterId}
                />
              ))}
            </div>
          ) : (
            <EmptyStateCard
              message="No promoter ticket sales data for this event."
              icon={<TicketIcon className="text-2xl" />}
            />
          )}
        </div>
      )}

      {guestListInfo && !isPromoter && promoterGuestStats && (
        <div>
          <h2 className="mb-1 font-medium">Promoter Guest List Summary</h2>
          <div className="flex flex-col gap-2">
            {promoterGuestStats.length > 0 ? (
              promoterGuestStats.map((promoter) => (
                <PromoterGuestsListData
                  guestListData={promoter}
                  key={promoter.promoterId}
                />
              ))
            ) : (
              <EmptyStateCard
                message="No promoter guests data found for this event."
                icon={<LuClipboardList className="text-2xl" />}
              />
            )}
          </div>
        </div>
      )}
    </SubPageContainer>
  );
};

export default SummaryContent;
