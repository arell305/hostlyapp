import React, { useMemo, useRef, useState, useCallback } from "react";
import { useDeleteGuestName } from "../hooks/useDeleteGuestName";
import { useUpdateGuestName } from "../hooks/useUpdateGuestName";
import ResponsiveEditGuestName from "../../components/responsive/ResponsiveEditGuestName";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import { filterGuestsByName } from "../../../../../utils/format";
import SectionContainer from "@/components/shared/containers/SectionContainer";
import EmptyList from "@/components/shared/EmptyList";
import GuestListContainer from "./GuestListContainer";
import { Id } from "convex/_generated/dataModel";
import { validateGuestEditInput } from "@/utils/form-validation/validateEventForm";
import SearchInput from "../components/SearchInput";
import {
  GuestListEntrySchema,
  GuestListEntryWithPromoter,
} from "@/types/schemas-types";

type PromoterGuestListContentProps = {
  guestListData: GuestListEntryWithPromoter[];
  isGuestListOpen: boolean;
};

const PromoterGuestListContent = ({
  guestListData,
  isGuestListOpen,
}: PromoterGuestListContentProps) => {
  const [editingId, setEditingId] = useState<Id<"guestListEntries"> | null>(
    null
  );
  const [editName, setEditName] = useState<string>("");
  const [editPhoneNumber, setEditPhoneNumber] = useState<string>("");
  const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false);
  const [initialName, setInitialName] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [deletingId, setDeletingId] = useState<Id<"guestListEntries"> | null>(
    null
  );
  const [showConfirmDeleteGuest, setShowConfirmDeleteGuest] =
    useState<boolean>(false);

  const {
    updateGuestName,
    isLoading: editNameLoading,
    error: updateGuestNameError,
    setError: setUpdateGuestNameError,
  } = useUpdateGuestName();

  const {
    deleteGuestName,
    isLoading: deleteNameLoading,
    error: deleteNameError,
    setError: setDeleteNameError,
  } = useDeleteGuestName();

  const handleEdit = (guest: GuestListEntrySchema) => {
    setEditingId(guest._id);
    setEditName(guest.name);
    setInitialName(guest.name);
    setShowEditNameModal(true);
    setEditPhoneNumber(guest.phoneNumber || "");
  };

  const handleShowDelete = (id: Id<"guestListEntries">) => {
    setDeletingId(id);
    setShowConfirmDeleteGuest(true);
  };

  const resetEditState = useCallback(() => {
    setEditingId(null);
    setInitialName(null);
    setEditName("");
    setEditPhoneNumber("");
    setErrors({});
    setUpdateGuestNameError(null);
  }, [setUpdateGuestNameError]);

  const handleEditModalOpenChange = useCallback(
    (open: boolean) => {
      setShowEditNameModal(open);
      if (!open) {
        // When the modal closes, wipe inputs + errors
        resetEditState();
      }
    },
    [resetEditState]
  );

  const handleSave = async () => {
    setErrors({});

    const result = validateGuestEditInput({
      name: editName,
      phoneNumber: editPhoneNumber,
      initialName,
    });

    if (!editingId) {
      setErrors({ name: "No guest selected" });
      return;
    }

    if (result.noChanges) {
      handleEditModalOpenChange(false);
      return;
    }

    if (!result.isValid) {
      setErrors(result.errors);
      if (Object.keys(result.errors).length === 0) {
        // Name is unchanged, no error needed, just close
        handleEditModalOpenChange(false);
      }
      return;
    }

    const formattedPhoneNumber =
      editPhoneNumber?.trim() === "" ? null : editPhoneNumber;

    const success = await updateGuestName(
      editingId,
      result.formattedName,
      formattedPhoneNumber
    );

    if (success) {
      handleEditModalOpenChange(false);
    }
  };

  const handleDelete = async () => {
    setDeleteNameError(null);
    if (!deletingId) {
      setDeleteNameError("No guest name selected");
      return;
    }

    if (!guestListData) {
      setDeleteNameError("No guest list found");
      return;
    }

    const success = await deleteGuestName(deletingId);
    if (success) {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setShowConfirmDeleteGuest(false);
    setDeletingId(null);
    setDeleteNameError(null);
  };

  const isEmptyGuestList = guestListData.length === 0;

  const filteredGuests = useMemo(() => {
    return filterGuestsByName(guestListData, searchTerm);
  }, [guestListData, searchTerm]);

  return (
    <SectionContainer>
      {isEmptyGuestList ? (
        <EmptyList items={[]} message="No guest list added." />
      ) : (
        <>
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchInputRef={searchInputRef}
            placeholder="Search guests..."
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
            isGuestListOpen={isGuestListOpen}
          />
        </>
      )}

      <ResponsiveEditGuestName
        isOpen={showEditNameModal}
        onOpenChange={handleEditModalOpenChange} // 👈 single source of truth
        editName={editName}
        setEditName={setEditName}
        error={updateGuestNameError}
        isLoading={editNameLoading}
        onSaveGuestName={handleSave}
        editPhoneNumber={editPhoneNumber}
        setEditPhoneNumber={setEditPhoneNumber}
        editNameError={errors.name || null}
        setEditNameError={(err) =>
          setErrors((prev) => ({ ...prev, name: err || undefined }))
        }
        editPhoneNumberError={errors.phone || null}
        setEditPhoneNumberError={(err) =>
          setErrors((prev) => ({ ...prev, phone: err || undefined }))
        }
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
