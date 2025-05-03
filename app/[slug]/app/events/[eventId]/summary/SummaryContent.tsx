import {
  GuestListInfoSchema,
  TicketInfoSchema,
  TicketSchemaWithPromoter,
} from "@/types/schemas-types";
import React, { useState } from "react";
import EmptyStateCard from "../../components/EmptyStateCard";
import {
  formatToTimeAndShortDate,
  isPast,
} from "../../../../../../utils/luxon";
import GuestListTimeCard from "../../components/GuestListTimeCard";
import TicketTimeCard from "../../components/TicketTimeCard";
import { LuClipboardList } from "react-icons/lu";
import { Promoter, TicketCounts } from "@/types/types";
import { Id } from "../../../../../../convex/_generated/dataModel";
import PromoterSelect from "../../components/PromoterSelect";
import { PromoterGuestsData } from "@/types/convex-types";
import PromoterGuestsListData from "./PromoterGuestsData";
import PromoterTicketData from "./PromoterTicketData";

interface SummaryContentProps {
  guestListInfo?: GuestListInfoSchema | null;
  ticketData?: TicketInfoSchema | null;
  tickets: TicketSchemaWithPromoter[];
  promoters: Promoter[];
  isPromoter: boolean;
  guestListResults: PromoterGuestsData | null;
  promoterTicketData: TicketCounts | null;
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  guestListInfo,
  ticketData,
  tickets,
  promoters,
  isPromoter,
  guestListResults,
  promoterTicketData,
}) => {
  const [selectedPromoterId, setSelectedPromoterId] = useState<
    Id<"users"> | "all"
  >("all");

  let isGuestListOpen: boolean = false;
  if (guestListInfo) {
    isGuestListOpen = !isPast(guestListInfo.guestListCloseTime);
  }

  let isCheckInOpen: boolean = false;
  if (guestListInfo) {
    isCheckInOpen = !isPast(guestListInfo.checkInCloseTime);
  }
  return (
    <div className="flex flex-col gap-4">
      <h2>Tickets</h2>
      {ticketData ? (
        <>
          <TicketTimeCard ticketData={ticketData} tickets={tickets} />
          {isPromoter && promoterTicketData && (
            <PromoterTicketData promoterTicketData={promoterTicketData} />
          )}
        </>
      ) : (
        <EmptyStateCard
          message="There is no ticket sales option for this event"
          icon={<LuClipboardList className="text-2xl" />}
        />
      )}
      <h2>Guest List</h2>
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
          {isPromoter && guestListResults && (
            <PromoterGuestsListData guestListResults={guestListResults} />
          )}
        </>
      ) : (
        <EmptyStateCard
          message="There is no guest list option for this event"
          icon={<LuClipboardList className="text-2xl" />}
        />
      )}

      {!isPromoter && (
        <PromoterSelect
          promoters={promoters}
          selectedPromoterId={selectedPromoterId}
          setSelectedPromoterId={setSelectedPromoterId}
        />
      )}
    </div>
  );
};

export default SummaryContent;
