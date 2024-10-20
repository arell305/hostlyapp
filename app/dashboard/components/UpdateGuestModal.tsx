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

interface UpdateGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: {
    id: string;
    name: string;
    malesInGroup?: number;
    femalesInGroup?: number;
  };
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
          <DialogTitle>Check In Guest: {guest.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <label>Males:</label>
            <Button onClick={() => setMaleCount(Math.max(0, maleCount - 1))}>
              <FaMinus />
            </Button>
            <Input
              type="number"
              value={maleCount}
              onChange={(e) => setMaleCount(Number(e.target.value))}
              className="w-20"
            />
            <Button onClick={() => setMaleCount(maleCount + 1)}>
              <FaPlus />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <label>Females:</label>
            <Button
              onClick={() => setFemaleCount(Math.max(0, femaleCount - 1))}
            >
              <FaMinus />
            </Button>
            <Input
              type="number"
              value={femaleCount}
              onChange={(e) => setFemaleCount(Number(e.target.value))}
              className="w-20"
            />
            <Button onClick={() => setFemaleCount(femaleCount + 1)}>
              <FaPlus />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGuestModal;
