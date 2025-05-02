import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV, FaCheckCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { GuestWithPromoter } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { formatArrivalTime } from "../../../../utils/luxon";

interface GuestCardProps {
  guest: GuestWithPromoter;
  editingId?: string | null;
  editName?: string;
  canEditGuests: boolean;
  onEdit?: (id: string, name: string) => void;
  onShowDelete?: (id: string) => void;
  onCancelEdit?: () => void;
  setEditName?: (name: string) => void;
  canSeePromoterName?: boolean;
  canCheckInGuests?: boolean;
  onCheckIn?: (guestId: string) => void;
  isCheckInOpen?: boolean;
  canSeePhoneNumber: boolean;
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
}) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const optionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions((prev) => !prev);
  };

  const handleShowDeleteModal = () => {
    if (onShowDelete) {
      onShowDelete(guest.id);
      setShowOptions(false);
    }
  };

  return (
    <div
      className={` border-b  p-4 w-full flex justify-between items-center ${canCheckInGuests && onCheckIn && isCheckInOpen ? "hover:bg-gray-100 cursor-pointer" : ""}`}
      onClick={() => {
        if (canCheckInGuests && onCheckIn && isCheckInOpen) {
          onCheckIn(guest.id);
        }
      }}
    >
      <div className="flex justify-center items-center">
        <div>
          <div className="flex items-center">
            <p className="text-xl font-semibold">{guest.name}</p>
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
        <div className="flex items-center justify-center flex-col w-[40px]">
          <>
            <FaCheckCircle
              className=" text-customDarkBlue text-center"
              size={33}
            />
            <p className="text-[10px] text-gray-500">
              {" "}
              {formatArrivalTime(guest.checkInTime)}
            </p>
          </>
        </div>
      )}
      {canEditGuests && !guest.attended && (
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleOptionsClick}
            ref={buttonRef}
          >
            <FaEllipsisV />
          </Button>
          {/* Dropdown Menu */}
          {showOptions && (
            <div
              ref={optionsRef}
              className="absolute right-0 z-10 w-48 bg-white border rounded-md shadow-lg"
            >
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) {
                      setShowOptions(false);
                      onEdit(guest.id, guest.name);
                    }
                  }}
                  className="block px-4 py-3  text-gray-700 hover:bg-gray-100 w-full text-left border-b"
                >
                  Edit
                </button>
                <button
                  onClick={handleShowDeleteModal}
                  className="block px-4 py-3  text-red-700 hover:bg-red-100 w-full text-left"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestCard;
