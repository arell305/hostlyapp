import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface AddGuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoterId: string;
  eventId: Id<"events">;
}

const AddGuestListModal: React.FC<AddGuestListModalProps> = ({
  isOpen,
  onClose,
  promoterId,
  eventId,
}) => {
  const [guestNames, setGuestNames] = useState("");
  const addGuestList = useMutation(api.guestLists.addGuestList);
  const { toast } = useToast();

  const handleSubmitGuestList = async () => {
    const names = guestNames
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name !== "");
    try {
      await addGuestList({
        newNames: names,
        clerkPromoterId: promoterId,
        eventId,
      });
      setGuestNames("");
      toast({
        title: "Guests Added",
        description: "The guest lists has successfully been updated",
      });
      onClose();
    } catch (error) {
      console.error("Error uploading guest list:", error);
      toast({
        title: "Error",
        description: "Failed to add guests. Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Guest List</DialogTitle>
        </DialogHeader>
        <textarea
          value={guestNames}
          onChange={(e) => setGuestNames(e.target.value)}
          placeholder="Enter guest names, one per line"
          rows={10}
          className="w-full p-2 border rounded mb-4"
        />
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmitGuestList}>Submit Guest List</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddGuestListModal;
