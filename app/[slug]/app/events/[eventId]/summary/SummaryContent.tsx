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
import { Promoter } from "@/types/types";
import { Id } from "../../../../../../convex/_generated/dataModel";
import PromoterSelect from "../../components/PromoterSelect";

interface SummaryContentProps {
  guestListInfo?: GuestListInfoSchema | null;
  ticketData?: TicketInfoSchema | null;
  tickets: TicketSchemaWithPromoter[];
  promoters: Promoter[];
}

const SummaryContent: React.FC<SummaryContentProps> = ({
  guestListInfo,
  ticketData,
  tickets,
  promoters,
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
      {ticketData ? (
        <TicketTimeCard ticketData={ticketData} tickets={tickets} />
      ) : (
        <EmptyStateCard
          title="Ticket Sales"
          message="There is no ticket sales option for this event"
          icon={<LuClipboardList className="text-2xl" />}
        />
      )}
      {guestListInfo ? (
        <GuestListTimeCard
          isCheckInOpen={isCheckInOpen}
          guestListClosed={isGuestListOpen}
          guestListCloseTime={formatToTimeAndShortDate(
            guestListInfo.guestListCloseTime
          )}
          formattedCheckInEndTime={formatToTimeAndShortDate(
            guestListInfo.checkInCloseTime
          )}
        />
      ) : (
        <EmptyStateCard
          title="Guest List"
          message="There is no guest list option for this event"
          icon={<LuClipboardList className="text-2xl" />}
        />
      )}
      <PromoterSelect
        promoters={promoters}
        selectedPromoterId={selectedPromoterId}
        setSelectedPromoterId={setSelectedPromoterId}
      />
    </div>
  );
};

export default SummaryContent;
