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

interface SummaryContentProps {
  guestListInfo?: GuestListInfoSchema | null;
  isPromoter: boolean;
  ticketInfo?: TicketInfoSchema | null;
  promoterGuestStatsData: {
    promoterGuestStats: PromoterGuestStatsData[];
    checkInData?: CheckInData;
  } | null;
  ticketSalesByPromoterData: GetTicketSalesByPromoterData | null;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  isPromoter,
  promoterGuestStatsData,
  guestListInfo,
  ticketInfo,
  ticketSalesByPromoterData,
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
            message="There is no guest list option for this event"
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
          <EmptyList
            items={ticketSalesByPromoterData.tickets}
            message="No promoter ticket sales found"
          />
          <div className="flex flex-col gap-2">
            {ticketSalesByPromoterData.tickets.map((ticket) => (
              <PromoterTicketData
                promoterTicketData={ticket}
                key={ticket.promoterId}
              />
            ))}
          </div>
        </div>
      )}

      {guestListInfo && !isPromoter && promoterGuestStatsData && (
        <div>
          <h2 className="mb-1">Promoter Guest List Summary</h2>
          <div className="flex flex-col gap-2">
            <EmptyList
              items={promoterGuestStatsData.promoterGuestStats}
              message="No promoter guests found"
            />
            {promoterGuestStatsData.promoterGuestStats.map((promoter) => (
              <PromoterGuestsListData
                guestListData={promoter}
                key={promoter.promoterId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryContent;
