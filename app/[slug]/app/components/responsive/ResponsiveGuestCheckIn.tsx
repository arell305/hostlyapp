import React, { useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";

import { GuestCheckIn } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BaseDrawer from "../drawer/BaseDrawer";
import { Loader2 } from "lucide-react";

interface ResponsiveGuestCheckInProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestCheckIn;
  onSave: (guestId: string, maleCount: number, femaleCount: number) => void;
  isLoading: boolean;
  error: string | null;
}

const ResponsiveGuestCheckIn: React.FC<ResponsiveGuestCheckInProps> = ({
  isOpen,
  onClose,
  guest,
  onSave,
  isLoading,
  error,
}) => {
  const [maleCount, setMaleCount] = useState(guest.malesInGroup || 0);
  const [femaleCount, setFemaleCount] = useState(guest.femalesInGroup || 0);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSave = () => {
    onSave(guest.id, maleCount, femaleCount);
    onClose();
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex flex-col">
              <p>Check In Guest:</p>
            </DialogTitle>
          </DialogHeader>
          <div className="my-4 flex items-center justify-between mx-10">
            <div className="flex flex-col items-center">
              <label className="text-xl mb-2">Males:</label>
              <div className="flex items-center gap-3">
                <CiCircleMinus
                  className="text-4xl"
                  onClick={() => setMaleCount(Math.max(0, maleCount - 1))}
                />
                <Input
                  type="number"
                  value={maleCount}
                  onChange={(e) => setMaleCount(Number(e.target.value))}
                  className="w-6 text-center items-center text-xl"
                />
                <CiCirclePlus
                  className="text-4xl"
                  onClick={() => setMaleCount(maleCount + 1)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between ">
              <div className="flex flex-col items-center">
                <label className="text-xl mb-2">Females:</label>
                <div className="flex items-center gap-3">
                  <CiCircleMinus
                    className="text-4xl"
                    onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
                  />
                  <Input
                    type="number"
                    value={femaleCount}
                    onChange={(e) => setFemaleCount(Number(e.target.value))}
                    className="w-6 text-center items-center text-xl"
                  />
                  <CiCirclePlus
                    className="text-4xl"
                    onClick={() => setFemaleCount(femaleCount + 1)}
                  />
                </div>
              </div>
            </div>
          </div>
          <p
            className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
          >
            {error || "Placeholder to maintain height"}
          </p>{" "}
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
              onClick={handleSave}
              disabled={isLoading}
            >
              {" "}
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onClose}
      title={`${guest.name || "Guest"}`}
      description={`Enter the amount of males and females in group`}
      confirmText={isLoading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={handleSave}
      error={error}
      isLoading={isLoading}
    >
      <div className="my-4 flex items-center justify-between mx-14">
        <div className="flex flex-col items-center">
          <label className=" mb-2">Males:</label>
          <div className="flex items-center gap-3">
            <CiCircleMinus
              className="text-4xl"
              onClick={() => setMaleCount(Math.max(0, maleCount - 1))}
            />
            <Input
              type="number"
              value={maleCount}
              onChange={(e) => setMaleCount(Number(e.target.value))}
              className="w-6 text-center items-center text-xl"
            />
            <CiCirclePlus
              className="text-4xl"
              onClick={() => setMaleCount(maleCount + 1)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between ">
          <div className="flex flex-col items-center">
            <label className=" mb-2">Females:</label>
            <div className="flex items-center gap-3">
              <CiCircleMinus
                className="text-4xl"
                onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
              />
              <Input
                type="number"
                value={femaleCount}
                onChange={(e) => setFemaleCount(Number(e.target.value))}
                className="w-6 text-center items-center text-xl"
              />
              <CiCirclePlus
                className="text-4xl"
                onClick={() => setFemaleCount(femaleCount + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </BaseDrawer>
  );
};

export default ResponsiveGuestCheckIn;
