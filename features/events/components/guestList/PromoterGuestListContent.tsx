"use client";

import { useState, useCallback } from "react";
import { useDeleteGuestName } from "@/domain/guestListEntries";
import { useUpdateGuestName } from "@/domain/guestListEntries";
import ResponsiveEditGuestName from "@shared/ui/responsive/ResponsiveEditGuestName";
import ResponsiveConfirm from "@shared/ui/responsive/ResponsiveConfirm";
import SectionContainer from "@shared/ui/containers/SectionContainer";
import EmptyList from "@shared/ui/list/EmptyList";
import GuestListContainer from "./GuestListContainer";
import { Doc, Id } from "convex/_generated/dataModel";
import { GuestListEntryWithPromoter } from "@shared/types/schemas-types";

type PromoterGuestListContentProps = {
  filteredGuests: GuestListEntryWithPromoter[];
  isGuestListOpen: boolean;
  searchTerm: string;
};

const PromoterGuestListContent = ({
  filteredGuests,
  isGuestListOpen,
}: PromoterGuestListContentProps) => {
  const [editingGuest, setEditingGuest] =
    useState<Doc<"guestListEntries"> | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [deletingId, setDeletingId] = useState<Id<"guestListEntries"> | null>(
    null
  );
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const {
    updateGuestName,
    isLoading: editLoading,
    error: editError,
    setError: setEditError,
  } = useUpdateGuestName();

  const {
    deleteGuestName,
    isLoading: deleteLoading,
    error: deleteError,
    setError: setDeleteError,
  } = useDeleteGuestName();

  const handleEdit = (guest: Doc<"guestListEntries">) => {
    setEditingGuest(guest);
    setShowEditModal(true);
  };

  const handleShowDelete = (id: Id<"guestListEntries">) => {
    setDeletingId(id);
    setShowConfirmDelete(true);
  };

  const handleEditModalClose = useCallback(
    (open: boolean) => {
      setShowEditModal(open);
      if (!open) {
        setEditingGuest(null);
        setEditError(null);
      }
    },
    [setEditError]
  );

  const handleSave = async (name: string, phoneNumber: string | null) => {
    if (!editingGuest) return false;

    const success = await updateGuestName(editingGuest._id, name, phoneNumber);
    if (success) {
      setEditingGuest(null);
      setEditError(null);
    }
    return success;
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const success = await deleteGuestName(deletingId);
    if (success) {
      setDeletingId(null);
      setShowConfirmDelete(false);
      setDeleteError(null);
    }
  };

  const isEmpty = filteredGuests.length === 0;

  return (
    <SectionContainer>
      {isEmpty ? (
        <EmptyList items={[]} message="No guest list added." />
      ) : (
        <GuestListContainer
          filteredGuests={filteredGuests}
          isCheckInOpen={false}
          canCheckInGuests={false}
          canSeePhoneNumber={true}
          editingId={editingGuest?._id ?? null}
          editName={editingGuest?.name ?? ""}
          onEdit={handleEdit}
          onShowDelete={handleShowDelete}
          onCancelEdit={() => setEditingGuest(null)}
          setEditName={() => {}}
          canEditGuests={true}
          isGuestListOpen={isGuestListOpen}
        />
      )}

      <ResponsiveEditGuestName
        isOpen={showEditModal}
        onOpenChange={handleEditModalClose}
        initialName={editingGuest?.name ?? ""}
        initialPhoneNumber={editingGuest?.phoneNumber ?? ""}
        onSave={handleSave}
        isLoading={editLoading}
        error={editError}
      />

      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Confirm Deletion"
        confirmText="Yes, Delete"
        cancelText="No, Keep"
        content="Are you sure you want to delete this guest? This action cannot be undone."
        confirmVariant="destructive"
        error={deleteError}
        isLoading={deleteLoading}
        modalProps={{
          onClose: () => {
            setShowConfirmDelete(false);
            setDeletingId(null);
            setDeleteError(null);
          },
          onConfirm: handleDelete,
        }}
        drawerProps={{
          onSubmit: handleDelete,
          onOpenChange: (open) => {
            if (!open) {
              setShowConfirmDelete(false);
              setDeletingId(null);
              setDeleteError(null);
            }
          },
        }}
      />
    </SectionContainer>
  );
};

export default PromoterGuestListContent;
