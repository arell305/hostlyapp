import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FaMinus, FaPlus } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import { CiCircleMinus } from "react-icons/ci";
import { GuestCheckIn } from "@/types";

interface UpdateGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestCheckIn;
  onSave: (guestId: string, maleCount: number, femaleCount: number) => void;
}

const UpdateGuestModal: React.FC<UpdateGuestModalProps> = ({
  isOpen,
  onClose,
  guest,
  onSave,
}) => {
  const [maleCount, setMaleCount] = useState(guest.malesInGroup || 0);
  const [femaleCount, setFemaleCount] = useState(guest.femalesInGroup || 0);

  const handleSave = () => {
    onSave(guest.id, maleCount, femaleCount);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-col">
            <p>Check In Guest:</p>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <p className=" mx-auto font-bold underline">{guest.name}</p>
          <div className="flex items-center justify-between md:px-[120px] px-[80px]">
            <label className="text-xl">Males:</label>
            <div className="flex items-center gap-2">
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
          <div className="flex items-center justify-between md:px-[120px] px-[80px]">
            <label className="text-xl">Females:</label>
            <div className="flex items-center gap-2">
              <CiCircleMinus
                className="text-4xl"
                onClick={() => setFemaleCount(Math.max(0, maleCount - 1))}
              />
              <Input
                type="number"
                value={femaleCount}
                onChange={(e) => setFemaleCount(Number(e.target.value))}
                className="w-6 text-center items-center text-xl"
              />
              <CiCirclePlus
                className="text-4xl"
                onClick={() => setFemaleCount(maleCount + 1)}
              />
            </div>
          </div>
          {/* <div className="flex justify-center gap-10 items-center ">
            <label>Females:</label>
            <div>
              <CiCircleMinus
                className="text-2xl"
                onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
              />
              <Input
                type="number"
                value={femaleCount}
                onChange={(e) => setFemaleCount(Number(e.target.value))}
                className="w-20 text-center"
              />
              <CiCirclePlus
                className="text-2xl"
                onClick={() => setFemaleCount(femaleCount + 1)}
              />
            </div>
          </div> */}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGuestModal;
