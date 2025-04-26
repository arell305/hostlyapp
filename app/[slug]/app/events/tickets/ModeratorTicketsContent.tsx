import React, { useMemo, useRef, useState } from "react";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import useRedeemTicket from "../../hooks/useRedeemTicket";
import { useToast } from "@/hooks/use-toast";
import useMediaQuery from "@/hooks/useMediaQuery";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import TicketList from "../../components/tickets/TicketList";
import { Input } from "@/components/ui/input";
import { DESKTOP_WIDTH } from "@/types/constants";
import { filterBySearchTerm } from "../../../../../utils/format";

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
    <>
      <div
        className="relative flex items-center bg-white mx-3 p-3 rounded-md shadow"
        onClick={() => {
          if (searchInputRef.current && !isDesktop) {
            searchInputRef.current.focus();
            setTimeout(() => {
              const rect = searchInputRef.current!.getBoundingClientRect();
              const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
              window.scrollTo({
                top: scrollTop + rect.top - 20,
                behavior: "smooth",
              });
            }, 100);
          }
        }}
      >
        <FaSearch className="absolute left-2 text-gray-700" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search Ticket ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-6"
        />
        {searchTerm !== "" && (
          <MdOutlineCancel
            onClick={() => setSearchTerm("")}
            className="cursor-pointer absolute right-4 text-gray-700 hover:text-gray-600 text-2xl"
          />
        )}
      </div>
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
    </>
  );
};

export default ModeratorTicketsContent;
