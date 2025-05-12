import { GuestListInfoSchema, TicketInfoSchema } from "@/types/schemas-types";
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
  CheckInData,
  GetTicketSalesByPromoterData,
} from "@/types/convex-types";
import PromoterGuestsListData from "./PromoterGuestsData";
import PromoterTicketData from "./PromoterTicketData";
import EmptyList from "@/components/shared/EmptyList";
import { TicketIcon } from "lucide-react";

interface SummaryContentProps {
  guestListInfo?: GuestListInfoSchema | null;
  isPromoter: boolean;
  ticketInfo?: TicketInfoSchema | null;
  promoterGuestStatsData: {
    promoterGuestStats: PromoterGuestStatsData[];
    checkInData?: CheckInData;
  } | null;
  ticketSalesByPromoterData: GetTicketSalesByPromoterData | null;
  canEditEvent: boolean;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  isPromoter,
  promoterGuestStatsData,
  guestListInfo,
  ticketInfo,
  ticketSalesByPromoterData,
  canEditEvent,
}) => {
  let isGuestListOpen: boolean = false;
  if (guestListInfo) {
    isGuestListOpen = !isPast(guestListInfo.guestListCloseTime);
  }

  let isCheckInOpen: boolean = false;
  if (guestListInfo) {
    isCheckInOpen = !isPast(guestListInfo.checkInCloseTime);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-1">Tickets</h2>
        {ticketInfo && ticketSalesByPromoterData ? (
          <>
            <TicketTimeCard
              ticketTotals={ticketSalesByPromoterData?.ticketTotals}
              ticketInfo={ticketInfo}
              canEditEvent={canEditEvent}
            />
            {isPromoter && (
              <PromoterTicketData
                promoterTicketData={ticketSalesByPromoterData.tickets[0]}
              />
            )}
          </>
        ) : (
          <EmptyStateCard
            message="There is no ticket option for this event."
            icon={<LuClipboardList className="text-2xl" />}
          />
        )}
      </div>
      <div>
        <h2 className="mb-1">Guest List</h2>
        {guestListInfo ? (
          <>
            <GuestListTimeCard
              isCheckInOpen={isCheckInOpen}
              isGuestListOpen={isGuestListOpen}
              guestListCloseTime={formatToTimeAndShortDate(
                guestListInfo.guestListCloseTime
              )}
              formattedCheckInEndTime={formatToTimeAndShortDate(
                guestListInfo.checkInCloseTime
              )}
            />
          </>
        ) : (
          <EmptyStateCard
            message="There is no guest list option for this event."
            icon={<LuClipboardList className="text-2xl" />}
          />
        )}
      </div>
      {isPromoter && promoterGuestStatsData && (
        <div>
          <h2 className="mb-1">Promoter Guest Attendance</h2>

          <PromoterGuestsListData
            guestListData={promoterGuestStatsData.promoterGuestStats[0]}
          />
        </div>
      )}
      {ticketInfo && !isPromoter && ticketSalesByPromoterData && (
        <div>
          <h2 className="mb-1">Promoter Ticket Sales</h2>
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

      {guestListInfo && !isPromoter && promoterGuestStatsData && (
        <div>
          <h2 className="mb-1">Promoter Guest List Summary</h2>
          <div className="flex flex-col gap-2">
            {promoterGuestStatsData.promoterGuestStats.length > 0 ? (
              <>
                {promoterGuestStatsData.promoterGuestStats.map((promoter) => (
                  <PromoterGuestsListData
                    guestListData={promoter}
                    key={promoter.promoterId}
                  />
                ))}
              </>
            ) : (
              <EmptyStateCard
                message="No promoter guests data found for this event."
                icon={<LuClipboardList className="text-2xl" />}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryContent;
