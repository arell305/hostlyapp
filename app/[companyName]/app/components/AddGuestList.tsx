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
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import useMediaQuery from "@/hooks/useMediaQuery";
import BaseDrawer from "./drawer/BaseDrawer";
import _ from "lodash";

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
  const [guestNames, setGuestNames] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const addGuestList = useMutation(api.guestLists.addGuestList);
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSubmitGuestList = async () => {
    const names = guestNames
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name !== "")
      .map((name) =>
        name
          .split(" ")
          .map((word) => _.capitalize(word.toLowerCase()))
          .join(" ")
      );
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Upload Guest List</DialogTitle>
          </DialogHeader>
          <Textarea
            value={guestNames}
            onChange={(e) => setGuestNames(e.target.value)}
            placeholder="Enter guest names, one per line"
            rows={10}
            className="w-full p-2 border rounded mb-4"
          />
          <DialogFooter>
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSubmitGuestList} disabled={loading}>
              {loading ? "Adding..." : "Add Guests"}{" "}
            </Button>{" "}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Upload Guest List"
      description={`Please enter each guest name on a separate line.`}
      confirmText={loading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={handleSubmitGuestList}
      error={null}
      isLoading={loading}
    >
      <Textarea
        value={guestNames}
        onChange={(e) => setGuestNames(e.target.value)}
        placeholder="Enter guest names, one per line"
        rows={10}
        className="border rounded mb-4 w-[90%] mx-auto"
      />
    </BaseDrawer>
  );
};

export default AddGuestListModal;
