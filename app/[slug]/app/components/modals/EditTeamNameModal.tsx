import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TeamNameModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  error: string | null;
  isLoading: boolean;
  onUpdateTeamName: () => void;
  setTeamNameError: (error: string | null) => void;
  setTeamName: (name: string) => void;
  teamName: string;
  onClose: () => void;
}

const TeamNameModal: React.FC<TeamNameModalProps> = ({
  isOpen,
  onOpenChange,
  error,
  isLoading,
  onUpdateTeamName,
  setTeamNameError,
  setTeamName,
  teamName,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] md:min-w-0 rounded">
        <DialogHeader>
          <DialogTitle className="flex">Team Name</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Enter name"
          value={teamName}
          onChange={(e) => {
            setTeamName(e.target.value);
            setTeamNameError(null);
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
            onClick={onUpdateTeamName}
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

export default TeamNameModal;
