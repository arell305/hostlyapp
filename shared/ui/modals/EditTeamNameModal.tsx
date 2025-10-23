"use client";

import { Button } from "@/shared/ui/primitive/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/primitive/dialog";
import { Input } from "@/shared/ui/primitive/input";

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
      <DialogContent className="rounded">
        <DialogHeader>
          <DialogTitle className="flex">Team Name</DialogTitle>
          <DialogDescription>Enter your team name below</DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Enter name"
          value={teamName}
          onChange={(e) => {
            setTeamName(e.target.value);
            setTeamNameError(null);
          }}
          className={`${error ? "border-red-500" : ""}`}
        />
        <p
          className={`text-sm mt-1 ${error ? "text-red-500" : "text-transparent"}`}
        >
          {error || "Placeholder to maintain height"}
        </p>
        <div className="flex justify-center space-x-10 mt-4">
          <Button
            disabled={isLoading}
            variant="ghost"
            onClick={onClose}
            className="font-semibold "
          >
            Cancel
          </Button>
          <Button
            className="bg-customDarkBlue rounded-[20px]  font-semibold"
            onClick={onUpdateTeamName}
            isLoading={isLoading}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamNameModal;
