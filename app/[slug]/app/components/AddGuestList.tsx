import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import useMediaQuery from "@/hooks/useMediaQuery";
import BaseDrawer from "./drawer/BaseDrawer";
import _ from "lodash";
import { FrontendErrorMessages, ResponseStatus } from "@/types/enums";
import { DESKTOP_WIDTH } from "@/types/constants";
import { useAddGuestList } from "../events/hooks/useAddGuestList";

interface AddGuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: Id<"events">;
}

const AddGuestListModal: React.FC<AddGuestListModalProps> = ({
  isOpen,
  onClose,
  eventId,
}) => {
  const [guestNames, setGuestNames] = useState<string>("");

  const { addGuestList, isLoading, error, setError } = useAddGuestList();
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  const handleSubmitGuestList = async () => {
    setError(null);

    if (guestNames.trim() === "") {
      setError(FrontendErrorMessages.NAME_EMPTY);
      return;
    }
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
    const success = await addGuestList(eventId, names);
    if (success) {
      onClose();
    }
  };
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Upload Guest List</DialogTitle>
            <DialogDescription>
              Please enter each guest name on a separate line.
            </DialogDescription>
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
            <Button onClick={handleSubmitGuestList} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Guests"}{" "}
            </Button>{" "}
          </DialogFooter>
          <p
            className={`text-sm mt-1 ${
              error ? "text-red-500" : "text-transparent"
            }`}
          >
            {error || "Placeholder to maintain height"}
          </p>
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
      confirmText={isLoading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={handleSubmitGuestList}
      error={error}
      isLoading={isLoading}
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

// To Be Deleted
