import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EditGuestNameModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onSaveGuestName: () => void;
  setEditNameError: (error: string | null) => void;
  setEditName: (name: string) => void;
  editName: string;
  onClose: () => void;
}

const EditGuestNameModal: React.FC<EditGuestNameModalProps> = ({
  isOpen,
  onOpenChange,
  error,
  isLoading,
  onSaveGuestName,
  setEditNameError,
  setEditName,
  editName,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded">
        <DialogHeader>
          <DialogTitle className="flex">Guest Name</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Enter name"
          value={editName}
          onChange={(e) => {
            setEditName(e.target.value);
            setEditNameError(null);
          }}
          className={error ? "border-red-500" : ""}
        />
        <p
          className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
        >
          {error || "Placeholder to maintain height"}
        </p>{" "}
        <div className="flex justify-center space-x-10 mt-4">
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold  w-[140px]"
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
            onClick={onSaveGuestName}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditGuestNameModal;
