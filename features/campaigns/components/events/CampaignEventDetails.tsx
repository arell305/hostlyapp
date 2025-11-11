"use client";

import SummaryContent from "@/features/events/components/summary/SummaryContent";
import { useEventContext } from "@/shared/hooks/contexts";

const CampaignEventDetails = () => {
  const { event } = useEventContext();
  return (
    <>
      <SummaryContent
        event={event}
        isPromoter={false}
        canEditEvent={false}
        promoterGuestStats={[]}
        ticketSalesByPromoterData={null}
      />
    </>
  );
};

export default CampaignEventDetails;
