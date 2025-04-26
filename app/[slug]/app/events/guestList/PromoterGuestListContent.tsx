import React, { useState } from "react";
import { PromoterGuestsData } from "@/types/convex-types";
import { formatToTimeAndShortDate, isPast } from "../../../../../utils/luxon";
import { useDeleteGuestName } from "../hooks/useDeleteGuestName";
import { useUpdateGuestName } from "../hooks/useUpdateGuestName";
import { FrontendErrorMessages } from "@/types/enums";
import { GuestListNameSchema } from "@/types/types";
import { Button } from "@/components/ui/button";
import { FiClock } from "react-icons/fi";
import { TbCircleLetterF, TbCircleLetterM } from "react-icons/tb";
import ToggleButton from "../../components/ui/ToggleButton";
import GuestCard from "../../components/GuestCard";
import ResponsiveEditGuestName from "../../components/responsive/ResponsiveEditGuestName";
import ResponsiveConfirm from "../../components/responsive/ResponsiveConfirm";
import { Id } from "../../../../../convex/_generated/dataModel";
import _ from "lodash";
import {
  formatName,
  getSortedFilteredGuests,
  getTotalFemales,
  getTotalMales,
} from "../../../../../utils/format";
import { useRouter, usePathname } from "next/navigation";

type PromoterGuestListContentProps = {
  eventId: Id<"events">;
  guestList: PromoterGuestsData;
  isGuestListOpen: boolean;
  guestListCloseTime: number;
};

const PromoterGuestListContent = ({
  eventId,
  guestList,
  isGuestListOpen,
  guestListCloseTime,
}: PromoterGuestListContentProps) => {
  const router = useRouter();
  const pathname = usePathname();

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

  const formattedGuestListCloseTime =
    formatToTimeAndShortDate(guestListCloseTime);

  const guestListClosed = isPast(guestListCloseTime);

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

    if (!guestList.guestListId) {
      setEditNameError("No guest list found");
      return;
    }

    const success = await updateGuestName(
      guestList.guestListId,
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

    if (!guestList.guestListId) {
      setDeleteNameError("No guest list found");
      return;
    }

    const success = await deleteGuestName(guestList.guestListId, deletingId);
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

  const isEmptyGuestList = guestList.guestListId === null;

  const totalMales = getTotalMales(guestList.names);
  const totalFemales = getTotalFemales(guestList.names);
  const filteredGuests = getSortedFilteredGuests(
    guestList.names,
    showCheckedInGuests
  );

  return (
    <div className="flex flex-col min-h-[80vh]  bg-gray-100 pt-4">
      <div className=" bg-white w-[95%] mx-auto px-4 pt-4 rounded-md mb-4 shadow-md">
        <div className="flex justify-between mb-2 items-center">
          <h1 className="text-2xl font-bold mb-2">Guest List</h1>

          {isGuestListOpen ? (
            <>
              <Button
                variant="navGhost"
                onClick={() => router.push(`${pathname}/add-guest-list`)}
              >
                Add Guests
              </Button>
            </>
          ) : (
            <p className="text-red-500 font-semibold">Closed</p>
          )}
        </div>
        <div className="mb-2 flex flex-col ">
          <div className="flex items-center space-x-3 py-3 border-b">
            <FiClock className="text-2xl text-gray-900" />
            <p>
              {guestListClosed ? "Guest List Closed:" : "Guest List Closes:"}{" "}
              <span className="text-gray-700 font-semibold">
                {formattedGuestListCloseTime}
              </span>
            </p>
          </div>
          <div className="flex items-center  space-x-3 py-3 border-b">
            <TbCircleLetterM className="text-2xl" />
            <p>
              Males Attended:{" "}
              <span className="text-gray-700 font-semibold">{totalMales}</span>
            </p>
          </div>
          <div className="flex items-center space-x-3 py-3">
            <TbCircleLetterF className="text-2xl" />
            <p>
              Females Attended:{" "}
              <span className="text-gray-700 font-semibold">
                {totalFemales}
              </span>
            </p>
          </div>
        </div>
      </div>
      {isEmptyGuestList ? (
        <p>No guest list added</p>
      ) : (
        <div className="mt-4 mb-[150px]">
          <div className="ml-4">
            <ToggleButton
              isChecked={showCheckedInGuests}
              setIsChecked={setShowCheckedInGuests}
            />
          </div>
          <div className="bg-white mt-3 ">
            {filteredGuests?.map((guest: GuestListNameSchema) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                editingId={editingId}
                editName={editName}
                canEditGuests={isGuestListOpen}
                onEdit={handleEdit}
                onCheckIn={handleSave}
                onShowDelete={handleShowDelete}
                onCancelEdit={() => setEditingId(null)}
                setEditName={setEditName}
                canCheckInGuests={false}
              />
            ))}
          </div>
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
    </div>
  );
};

export default PromoterGuestListContent;
