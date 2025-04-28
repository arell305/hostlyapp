import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import useRedeemTicket from "../../hooks/useRedeemTicket";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useRef, useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { DESKTOP_WIDTH } from "@/types/constants";
import { filterBySearchTerm } from "../../../../../utils/format";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import SearchInput from "../../events/components/SearchInput";
import TicketList from "./TicketList";
import ResponsiveConfirm from "../responsive/ResponsiveConfirm";

interface TicketInfoTabProps {
  tickets: TicketSchemaWithPromoter[];
  canCheckInGuests: boolean;
}

const TicketTab: React.FC<TicketInfoTabProps> = ({
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
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

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
        isDesktop={isDesktop}
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

export default TicketTab;
