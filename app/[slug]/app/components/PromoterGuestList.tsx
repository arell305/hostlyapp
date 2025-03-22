import React, { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import AddGuestListModal from "./AddGuestList";
import { useToast } from "@/hooks/use-toast";
import GuestCard from "./GuestCard";
import { GuestListNameSchema } from "@/types/types";
import { FiClock } from "react-icons/fi";
import { TbCircleLetterF, TbCircleLetterM } from "react-icons/tb";
import ToggleButton from "./ui/ToggleButton";
import ResponsiveEditGuestName from "./responsive/ResponsiveEditGuestName";
import ResponsiveConfirm from "./responsive/ResponsiveConfirm";
import _ from "lodash";
import { formatToTimeAndShortDate, isPast } from "../../../../utils/luxon";
import FullLoading from "./loading/FullLoading";
import ErrorComponent from "./errors/ErrorComponent";
import { ResponseStatus, FrontendErrorMessages } from "@/types/enums";

type GuestListManagerProps = {
  eventId: Id<"events">;
  isGuestListOpen: boolean;
  guestListCloseTime: number;
};

const PromoterGuestListPage = ({
  eventId,
  isGuestListOpen,
  guestListCloseTime,
}: GuestListManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false);
  const [editNameLoading, setEditNameLoading] = useState<boolean>(false);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [initialName, setInitialName] = useState<string | null>(null);

  // delete guest states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmDeleteGuest, setShowConfirmDeleteGuest] =
    useState<boolean>(false);
  const [deleteNameLoading, setDeleteNameLoading] = useState<boolean>(false);
  const [deleteNameError, setDeleteNameError] = useState<string | null>(null);

  const [isGuestListModalOpen, setIsGuestListModalOpen] = useState(false);
  const [showCheckedInGuests, setShowCheckedInGuests] =
    useState<boolean>(false);

  const formattedGuestListCloseTime =
    formatToTimeAndShortDate(guestListCloseTime);

  const getGuestListByPromoterResponse = useQuery(
    api.guestLists.getGuestListByPromoter,
    {
      eventId,
    }
  );
  const updateGuestName = useMutation(api.guestLists.updateGuestName);
  const deleteGuestName = useMutation(api.guestLists.deleteGuestName);
  const { toast } = useToast();

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

    const newName = editName
      .split(" ")
      .map((word) => _.capitalize(word.toLowerCase()))
      .join(" ");

    if (newName === initialName) {
      setShowEditNameModal(false);
      return;
    }

    if (!getGuestListByPromoterResponse?.data?.guestListId) {
      setEditNameError(FrontendErrorMessages.GENERIC_ERROR);
      console.error(FrontendErrorMessages.GUESTLIST_BY_PROMOTER_LOAD_ERROR);
      return;
    }

    if (!editingId) {
      setEditNameError("No name selected");
      return;
    }

    setEditNameLoading(true);
    try {
      const response = await updateGuestName({
        guestListId: getGuestListByPromoterResponse.data.guestListId,
        guestId: editingId,
        newName,
      });
      if (response.status === ResponseStatus.SUCCESS) {
        setShowEditNameModal(false);
        toast({
          title: "Name updated",
          description: "Name has been successfully updated",
        });
        setEditingId(null);
      } else {
        setEditNameError(FrontendErrorMessages.GENERIC_ERROR);
        console.error(response.error);
      }
    } catch (error) {
      console.error("Error updating guest name:", error);
      setEditNameError("Failed to update name. Please try again");
    } finally {
      setEditNameLoading(false);
      setInitialName(null);
    }
  };

  const handleDelete = async () => {
    setDeleteNameError(null);
    if (!deletingId) {
      setDeleteNameError("No guest name selected");
      return;
    }

    if (!getGuestListByPromoterResponse?.data?.guestListId) {
      setDeleteNameError(FrontendErrorMessages.GENERIC_ERROR);
      console.error("error loading guest list by promoter");
      return;
    }
    setDeleteNameLoading(true);
    try {
      const response = await deleteGuestName({
        guestListId: getGuestListByPromoterResponse.data.guestListId,
        guestId: deletingId,
      });
      if (response.status === ResponseStatus.SUCCESS) {
        setShowConfirmDeleteGuest(false);
        toast({
          title: "Guest Deleted",
          description: "Guest has been successfully delted",
        });
        setDeletingId(null);
      } else {
        setDeleteNameError(FrontendErrorMessages.GENERIC_ERROR);
        console.error(response.error);
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
      setDeleteNameError("Error deleting guest");
    } finally {
      setDeleteNameLoading(false);
    }
  };

  if (!getGuestListByPromoterResponse) {
    return <FullLoading />;
  }

  if (getGuestListByPromoterResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={getGuestListByPromoterResponse.error} />;
  }

  const isEmptyGuestList =
    getGuestListByPromoterResponse.data?.guestListId === null;

  const totalMales = getGuestListByPromoterResponse.data?.names.reduce(
    (sum: number, guest: GuestListNameSchema) =>
      sum + (guest.malesInGroup || 0),
    0
  );
  const totalFemales = getGuestListByPromoterResponse.data?.names.reduce(
    (sum: number, guest: GuestListNameSchema) =>
      sum + (guest.femalesInGroup || 0),
    0
  );

  const filteredGuests = getGuestListByPromoterResponse.data?.names
    .filter((guest: GuestListNameSchema) =>
      showCheckedInGuests ? guest.attended : !guest.attended
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col min-h-[80vh]  bg-gray-100 pt-4">
      <div className=" bg-white w-[95%] mx-auto px-4 pt-4 rounded-md mb-4 shadow-md">
        <div className="flex justify-between mb-2 items-center">
          <h1 className="text-2xl font-bold mb-2">Guest List</h1>

          {isGuestListOpen ? (
            <>
              <Button
                variant="navGhost"
                onClick={() => setIsGuestListModalOpen(true)}
              >
                Add Guests
              </Button>

              <AddGuestListModal
                isOpen={isGuestListModalOpen}
                onClose={() => setIsGuestListModalOpen(false)}
                eventId={eventId}
              />
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
          onClose: () => setShowConfirmDeleteGuest(false),
          onConfirm: handleDelete,
        }}
        drawerProps={{
          onSubmit: handleDelete,
          onOpenChange: (open) => setShowConfirmDeleteGuest(open),
        }}
      />
    </div>
  );
};

export default PromoterGuestListPage;
