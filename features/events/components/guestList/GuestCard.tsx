"use client";

import { FaCheckCircle } from "react-icons/fa";
import { Badge } from "@/shared/ui/primitive/badge";
import { formatArrivalTime } from "@/shared/utils/luxon";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { Pencil, Trash } from "lucide-react";
import { GuestListEntryWithPromoter } from "@shared/types/schemas-types";

import { Doc, Id } from "convex/_generated/dataModel";
import { formatPhoneNumber } from "@/shared/utils/format";
interface GuestCardProps {
  guest: GuestListEntryWithPromoter;
  editingId?: Id<"guestListEntries"> | null;
  editName?: string;
  canEditGuests: boolean;
  onEdit?: (guest: Doc<"guestListEntries">) => void;
  onShowDelete?: (id: Id<"guestListEntries">) => void;
  onCancelEdit?: () => void;
  setEditName?: (name: string) => void;
  canSeePromoterName?: boolean;
  canCheckInGuests?: boolean;
  onCheckIn?: (guest: GuestListEntryWithPromoter) => void;
  isCheckInOpen?: boolean;
  canSeePhoneNumber: boolean;
  isGuestListOpen?: boolean;
}

const GuestCard: React.FC<GuestCardProps> = ({
  guest,
  canEditGuests,
  onEdit,
  onShowDelete,
  canSeePromoterName,
  canCheckInGuests,
  onCheckIn,
  isCheckInOpen,
  canSeePhoneNumber,
  isGuestListOpen,
}) => {
  const handleShowDeleteModal = () => {
    if (onShowDelete) {
      onShowDelete(guest._id);
    }
  };
  const canUpdateGuestName =
    canEditGuests && !guest.attended && isGuestListOpen;
  const canCheckInGuest = canCheckInGuests && onCheckIn && isCheckInOpen;

  return (
    <div
      className={` border-b  p-4 w-full flex justify-between items-center ${canCheckInGuest ? "hover:bg-cardBackgroundHover cursor-pointer" : ""}`}
      onClick={() => {
        if (canCheckInGuest) {
          onCheckIn(guest);
        }
      }}
    >
      <div className="flex justify-center items-center">
        <div>
          <div className="flex items-center">
            <p className="text-xl font-semibold">{guest.name}</p>
            {canSeePhoneNumber && guest.phoneNumber && (
              <p className="text-lg text-whiteText/70 font-normal pt-[2px] ml-2">
                {formatPhoneNumber(guest.phoneNumber)}
              </p>
            )}
          </div>
          <div className="flex ">
            {canSeePromoterName && (
              <p className="text-sm text-gray-500 font-normal pt-[2px] mr-2">
                {guest.promoterName}
              </p>
            )}
            {guest.attended && guest.checkInTime && (
              <div className="flex pt-[2px] space-x-1 ">
                <Badge>Males: {guest.malesInGroup || 0}</Badge>
                <Badge>Females: {guest.femalesInGroup || 0}</Badge>
              </div>
            )}
          </div>
        </div>
      </div>
      {guest.attended && guest.checkInTime && (
        <div className="flex items-center justify-center flex-col gap-y-1 w-[40px]">
          <FaCheckCircle className=" text-primaryBlue text-center" size={33} />
          <p className="text-xs text-grayText">
            {" "}
            {formatArrivalTime(guest.checkInTime)}
          </p>
        </div>
      )}
      {canUpdateGuestName && (
        <div className="flex gap-2">
          {onEdit && (
            <IconButton
              icon={<Pencil size={20} />}
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(guest);
              }}
            />
          )}
          <IconButton
            icon={<Trash size={20} />}
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              handleShowDeleteModal();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GuestCard;
