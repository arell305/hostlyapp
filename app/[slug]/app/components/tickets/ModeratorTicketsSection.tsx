import { useQuery } from "convex/react";
import React, { useMemo, useRef, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import EventInfoSkeleton from "../loading/EventInfoSkeleton";
import { ResponseStatus } from "../../../../../utils/enum";
import SubErrorComponent from "../errors/SubErrorComponent";
import { useToast } from "@/hooks/use-toast";
import useRedeemTicket from "../../hooks/useRedeemTicket";
import { TicketSchemaWithPromoter } from "@/types/schemas-types";
import useMediaQuery from "@/hooks/useMediaQuery";
import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { MdOutlineCancel } from "react-icons/md";
import ResponsiveConfirm from "../responsive/ResponsiveConfirm";
import TicketList from "./TicketList";

interface ModeratorTicketsSectionProps {
  eventId: Id<"events">;
}

const ModeratorTicketsSection: React.FC<ModeratorTicketsSectionProps> = ({
  eventId,
}) => {
  const { toast } = useToast();

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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleConfirmRedeem = async () => {
    const result = await handleRedeem();
    if (result) {
      toast({
        title: "Success",
        description: "Ticket Redeemed",
      });
    }
  };
  const response = useQuery(api.tickets.getTicketsByEventId, {
    eventId,
  });

  const filteredTickets = useMemo(() => {
    if (!response || !response.data) return [];
    return response.data.tickets.filter((ticket: TicketSchemaWithPromoter) =>
      ticket.ticketUniqueId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [response, searchTerm]);

  if (!response) {
    return <EventInfoSkeleton />;
  }

  if (response.status === ResponseStatus.ERROR) {
    return <SubErrorComponent />;
  }

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

export default ModeratorTicketsSection;
