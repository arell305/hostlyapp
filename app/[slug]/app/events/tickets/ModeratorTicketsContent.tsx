import React, { useMemo, useRef, useState } from "react";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import useRedeemTicket from "../../hooks/useRedeemTicket";
import { useToast } from "@/hooks/use-toast";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import TicketList from "../../components/tickets/TicketList";
import { filterBySearchTerm } from "../../../../../utils/format";
import SearchInput from "../components/SearchInput";
import SectionContainer from "@/components/shared/containers/SectionContainer";

interface ModeratorTicketsContentProps {
  tickets: TicketSchemaWithPromoter[];
}

const ModeratorTicketsContent: React.FC<ModeratorTicketsContentProps> = ({
  tickets,
}) => {
  const {
    redeemTicketError,
    isRedeemTicketLoading,
    selectedTicketId,
    setSelectedTicketId,
    handleRedeem,
    setRedeemTicketError,
  } = useRedeemTicket();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleConfirmRedeem = async () => {
    const result = await handleRedeem();
    if (result) {
      toast({
        title: "Success",
        description: "Ticket Redeemed",
      });
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
        canCheckInTickets={true}
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

export default ModeratorTicketsContent;
