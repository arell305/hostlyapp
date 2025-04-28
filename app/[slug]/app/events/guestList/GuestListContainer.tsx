import CustomCard from "@/components/shared/cards/CustomCard";
import EmptyList from "@/components/shared/EmptyList";
import { GuestWithPromoter } from "@/types/types";
import React from "react";
import GuestCard from "../../components/GuestCard";

interface GuestListContainerProps {
  filteredGuests: GuestWithPromoter[];
  handleCheckInGuest?: (guestId: string) => void;
  isCheckInOpen: boolean;
  canCheckInGuests: boolean;
  canSeePhoneNumber: boolean;
  editingId?: string | null;
  editName?: string;
  onEdit?: (id: string, name: string) => void;
  onShowDelete?: (id: string) => void;
  onCancelEdit?: () => void;
  setEditName?: (name: string) => void;
}
const GuestListContainer = ({
  filteredGuests,
  handleCheckInGuest,
  isCheckInOpen,
  canCheckInGuests,
  canSeePhoneNumber,
  editingId,
  editName,
  onEdit,
  onShowDelete,
  onCancelEdit,
  setEditName,
}: GuestListContainerProps) => {
  if (filteredGuests.length === 0) {
    return <EmptyList items={filteredGuests} />;
  }
  return (
    <CustomCard>
      {filteredGuests.map((guest: GuestWithPromoter) => (
        <GuestCard
          key={guest.id}
          guest={guest}
          canEditGuests={false}
          canSeePromoterName={true}
          canCheckInGuests={canCheckInGuests}
          onCheckIn={handleCheckInGuest}
          isCheckInOpen={isCheckInOpen}
          canSeePhoneNumber={canSeePhoneNumber}
          editingId={editingId}
          editName={editName}
          onEdit={onEdit}
          onShowDelete={onShowDelete}
          onCancelEdit={onCancelEdit}
          setEditName={setEditName}
        />
      ))}
    </CustomCard>
  );
};

export default GuestListContainer;
