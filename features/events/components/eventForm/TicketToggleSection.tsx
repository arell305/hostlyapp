"use client";

import { useState } from "react";
import ToggleSectionCard from "@/shared/ui/toggle/ToggleSectionCard";
import TicketSection from "./TicketSection";
import { useEventForm } from "@/shared/hooks/contexts";
import { TicketType } from "@shared/types/types";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";

interface TicketToggleSectionProps {
  isStripeEnabled: boolean;
  isEdit: boolean;
  initialTicketData?: TicketType[] | null;
}

const TicketToggleSection: React.FC<TicketToggleSectionProps> = ({
  isStripeEnabled,
  isEdit,
  initialTicketData,
}) => {
  const { setTicketTypes, isTicketsSelected, setIsTicketsSelected } =
    useEventForm();

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleRemoveTickets = () => {
    if (isEdit && initialTicketData?.length) {
      setShowConfirmModal(true);
    } else {
      setIsTicketsSelected(false);
    }
  };

  const handleConfirmRemove = () => {
    setIsTicketsSelected(false);
    setShowConfirmModal(false);
  };

  if (!isStripeEnabled) {
    return (
      <p className="text-red-700 px-4">
        Please have admin integrate Stripe before selling tickets.
      </p>
    );
  }

  return (
    <>
      <ToggleSectionCard
        label="TICKET OPTION"
        isActive={isTicketsSelected}
        onToggle={() => {
          if (isTicketsSelected) {
            handleRemoveTickets();
          } else {
            setIsTicketsSelected(true);
            setTicketTypes([
              {
                name: "",
                price: "",
                capacity: "",
                ticketSalesEndTime: null,
                showCustomInput: false,
                description: null,
              },
            ]);
          }
        }}
      />

      {isTicketsSelected && (
        <TicketSection isEdit={isEdit} initialTicketData={initialTicketData} />
      )}

      {showConfirmModal && (
        <ResponsiveConfirm
          isOpen={showConfirmModal}
          title="Confirm Ticket Removal"
          content="Are you sure you want to remove all tickets? This action cannot be undone."
          confirmText="Remove Tickets"
          cancelText="Cancel"
          confirmVariant="destructive"
          modalProps={{
            onClose: () => setShowConfirmModal(false),
            onConfirm: handleConfirmRemove,
          }}
          drawerProps={{
            onOpenChange: (open) => setShowConfirmModal(open),
            onSubmit: handleConfirmRemove,
          }}
          error={null}
          isLoading={false}
        />
      )}
    </>
  );
};

export default TicketToggleSection;
