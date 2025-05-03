import React, { useState } from "react";
import { GetEventWithGuestListsData } from "@/types/convex-types";
import { useDeleteGuestName } from "../hooks/useDeleteGuestName";
import { useUpdateGuestName } from "../hooks/useUpdateGuestName";
import { FrontendErrorMessages } from "@/types/enums";
import ToggleButton from "../../components/ui/ToggleButton";
import ResponsiveEditGuestName from "../../components/responsive/ResponsiveEditGuestName";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import _ from "lodash";
import {
  formatName,
  getSortedFilteredGuests,
} from "../../../../../utils/format";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import EmptyList from "@/components/shared/EmptyList";
import GuestListContainer from "./GuestListContainer";

type PromoterGuestListContentProps = {
  guestListData: GetEventWithGuestListsData;
};

const PromoterGuestListContent = ({
  guestListData,
}: PromoterGuestListContentProps) => {
  const guestList = guestListData.guests;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false);
  const [initialName, setInitialName] = useState<string | null>(null);

  // delete guest states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmDeleteGuest, setShowConfirmDeleteGuest] =
    useState<boolean>(false);

  const [showCheckedInGuests, setShowCheckedInGuests] =
    useState<boolean>(false);

  const {
    updateGuestName,
    isLoading: editNameLoading,
    error: editNameError,
    setError: setEditNameError,
  } = useUpdateGuestName();

  const {
    deleteGuestName,
    isLoading: deleteNameLoading,
    error: deleteNameError,
    setError: setDeleteNameError,
  } = useDeleteGuestName();

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
    setInitialName(name);
    setShowEditNameModal(true);
  };

  const handleShowDelete = (id: string) => {
    setDeletingId(id);
    setShowConfirmDeleteGuest(true);
  };

  const handleSave = async () => {
    setEditNameError(null);

    if (editName.trim() === "") {
      setEditNameError(FrontendErrorMessages.NAME_EMPTY);
      return;
    }

    const newName = formatName(editName);

    if (newName === initialName) {
      setShowEditNameModal(false);
      return;
    }

    if (!editingId) {
      setEditNameError("No name selected");
      return;
    }
    if (!guestListData.guests) {
      setEditNameError("No guest list found");
      return;
    }
    if (!guestList) {
      setEditNameError("No guest list found");
      return;
    }
    const success = await updateGuestName(
      guestList[0].guestListId,
      editingId,
      newName
    );
    if (success) {
      handleCloseModal();
    }
  };
  const handleDelete = async () => {
    setDeleteNameError(null);
    if (!deletingId) {
      setDeleteNameError("No guest name selected");
      return;
    }

    if (!guestList) {
      setDeleteNameError("No guest list found");
      return;
    }

    const success = await deleteGuestName(guestList[0].guestListId, deletingId);
    if (success) {
      setDeletingId(null);
      setShowConfirmDeleteGuest(false);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmDeleteGuest(false);
    setDeletingId(null);
    setDeleteNameError(null);
  };

  const isEmptyGuestList = guestList.length === 0;

  const filteredGuests = getSortedFilteredGuests(
    guestList.map((guest) => ({
      ...guest,
      name: guest.name,
      promoterId: guest.promoterId,
      promoterName: guest.promoterName,
      guestListId: guest.guestListId,
    })),
    showCheckedInGuests
  );

  return (
    <SectionContainer>
      {isEmptyGuestList ? (
        <EmptyList items={[]} message="No guest list added" />
      ) : (
        <div className="space-y-4">
          <ToggleButton
            isChecked={showCheckedInGuests}
            setIsChecked={setShowCheckedInGuests}
          />
          <GuestListContainer
            filteredGuests={filteredGuests}
            isCheckInOpen={false}
            canCheckInGuests={false}
            canSeePhoneNumber={true}
            editingId={editingId}
            editName={editName}
            onEdit={handleEdit}
            onShowDelete={handleShowDelete}
            onCancelEdit={() => setEditingId(null)}
            setEditName={setEditName}
            canEditGuests={true}
          />
        </div>
      )}
      <ResponsiveEditGuestName
        isOpen={showEditNameModal}
        onOpenChange={setShowEditNameModal}
        editName={editName}
        setEditName={setEditName}
        error={editNameError}
        isLoading={editNameLoading}
        onSaveGuestName={handleSave}
        setEditNameError={setEditNameError}
      />
      <ResponsiveConfirm
        isOpen={showConfirmDeleteGuest}
        title="Confirm Deletion"
        confirmText="Yes, Delete"
        cancelText="No, Keep"
        content="Are you sure you want to delete guest? This action cannot be undone."
        confirmVariant="destructive"
        error={deleteNameError}
        isLoading={deleteNameLoading}
        modalProps={{
          onClose: handleCloseModal,
          onConfirm: handleDelete,
        }}
        drawerProps={{
          onSubmit: handleDelete,
          onOpenChange: handleCloseModal,
        }}
      />
    </SectionContainer>
  );
};

export default PromoterGuestListContent;
