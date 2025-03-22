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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const addGuestList = useMutation(api.guestLists.addGuestList);
  const { toast } = useToast();
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
    setLoading(true);
    try {
      const response = await addGuestList({
        newNames: names,
        eventId,
      });

      if (response.status === ResponseStatus.SUCCESS) {
        setGuestNames("");
        toast({
          title: "Guests Added",
          description: "The guest lists has successfully been updated",
        });
        onClose();
      } else {
        setError(FrontendErrorMessages.GENERIC_ERROR);
        console.error(response.error);
      }
    } catch (error) {
      console.error("Error uploading guest list:", error);
      setError(FrontendErrorMessages.GENERIC_ERROR);
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
            <Button onClick={handleSubmitGuestList} disabled={loading}>
              {loading ? "Adding..." : "Add Guests"}{" "}
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
      confirmText={loading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={handleSubmitGuestList}
      error={error}
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
