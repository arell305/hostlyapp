import React from "react";
import {
  FaPencilAlt,
  FaTrashAlt,
  FaCheck,
  FaTimes,
  FaCheckCircle,
  FaUserCheck,
} from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatArrivalTime } from "../../../utils/helpers";

interface GuestCardProps {
  guest: {
    id: string;
    name: string;
    attended?: boolean;
    malesInGroup?: number;
    femalesInGroup?: number;
    checkInTime?: string;
    promoterName?: string;
  };
  editingId?: string | null;
  editName?: string;
  canEditGuests: boolean;
  onEdit?: (id: string, name: string) => void;
  onSave?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCancelEdit?: () => void;
  setEditName?: (name: string) => void;
  canSeePromoterName?: boolean;
  canCheckInGuests?: boolean;
  onCheckIn?: (guestId: string) => void;
}

const GuestCard: React.FC<GuestCardProps> = ({
  guest,
  editingId,
  editName,
  canEditGuests,
  onEdit,
  onSave,
  onDelete,
  onCancelEdit,
  setEditName,
  canSeePromoterName,
  canCheckInGuests,
  onCheckIn,
}) => {
  console.log("oncheckin", onCheckIn);
  console.log("canCheck", canCheckInGuests);
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            {editingId === guest.id && setEditName ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <span>{guest.name}</span>
                {guest.attended && (
                  <FaCheckCircle className="ml-2 text-green-500" />
                )}
              </div>
            )}
            {canEditGuests &&
              !guest.attended &&
              onSave &&
              onEdit &&
              onDelete && (
                <div className="flex justify-end space-x-2">
                  {editingId === guest.id ? (
                    <>
                      <Button onClick={() => onSave(guest.id)} size="sm">
                        <FaCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={onCancelEdit}
                        size="sm"
                        variant="outline"
                      >
                        <FaTimes className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onEdit(guest.id, guest.name)}
                        size="sm"
                      >
                        <FaPencilAlt className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onDelete(guest.id)}
                        size="sm"
                      >
                        <FaTrashAlt className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            {canCheckInGuests && onCheckIn && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCheckIn(guest.id)}
                className="border"
              >
                <FaUserCheck className="h-6 w-6" />
              </Button>
            )}
          </div>
          {canSeePromoterName && (
            <p className="text-sm font-normal pt-2">{guest.promoterName}</p>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {guest.attended && guest.checkInTime && (
          <div className="flex flex-col">
            <div className="flex justify-between">
              <div>
                <span>Males: {guest.malesInGroup || 0}</span>
                <span className="ml-4">
                  Females: {guest.femalesInGroup || 0}
                </span>
              </div>
              <span className="text-gray-500">
                Arrived: {formatArrivalTime(guest.checkInTime)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestCard;
