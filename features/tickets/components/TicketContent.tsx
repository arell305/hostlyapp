"use client";

import useRedeemTicket from "@/domain/tickets/useRedeemTicket";
import { useMemo, useRef, useState } from "react";
import { filterBySearchTerm } from "@shared/utils/format";
import SectionContainer from "@shared/ui/containers/SectionContainer";
import SearchInput from "../../events/components/SearchInput";
import ResponsiveConfirm from "@shared/ui/responsive/ResponsiveConfirm";
import { TicketSchemaWithPromoter } from "@shared/types/schemas-types";
import TicketList from "@/features/tickets/components/TicketList";

interface TicketContentProps {
  tickets: TicketSchemaWithPromoter[];
  canCheckInGuests: boolean;
}

const TicketContent: React.FC<TicketContentProps> = ({
  tickets,
  canCheckInGuests,
}) => {
  const {
    redeemTicketError,
    isRedeemTicketLoading,
    selectedTicketId,
    setSelectedTicketId,
    handleRedeem,
    setRedeemTicketError,
  } = useRedeemTicket();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleConfirmRedeem = async () => {
    const result = await handleRedeem();
    if (result) {
      setShowRedeemModal(false);
      setSelectedTicketId("");
      setRedeemTicketError(null);
    }
  };

  const filteredTickets = useMemo(() => {
    return filterBySearchTerm(tickets, searchTerm, (t) => t.ticketUniqueId);
  }, [tickets, searchTerm]);

  return (
    <SectionContainer>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search Ticket ID..."
      />

      <TicketList
        tickets={filteredTickets}
        canCheckInTickets={canCheckInGuests}
        setSelectedTicketId={setSelectedTicketId}
        setShowRedeemTicket={setShowRedeemModal}
      />
      <ResponsiveConfirm
        isOpen={showRedeemModal}
        title={"Redeem Ticket"}
        confirmText={"Redeem"}
        cancelText={"Cancel"}
        content={`Redeem ticket for ${selectedTicketId}`}
        error={redeemTicketError}
        isLoading={isRedeemTicketLoading}
        modalProps={{
          onClose: () => {
            setShowRedeemModal(false);
            setSelectedTicketId("");
            setRedeemTicketError(null);
          },
          onConfirm: handleConfirmRedeem,
        }}
        drawerProps={{
          onSubmit: handleConfirmRedeem,
          onOpenChange: (open) => {
            setShowRedeemModal(false);
            setSelectedTicketId("");
            setRedeemTicketError(null);
          },
        }}
      />
    </SectionContainer>
  );
};

export default TicketContent;
