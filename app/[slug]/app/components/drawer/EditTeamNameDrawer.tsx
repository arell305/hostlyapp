import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TeamNameDrawerProps {
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

const TeamNameDrawer: React.FC<TeamNameDrawerProps> = ({
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
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Team Name</DrawerTitle>
          <DrawerDescription>Enter your team name below</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
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
        </div>
        <DrawerFooter className="flex flex-col gap-4">
          <div className="flex justify-center items-center space-x-10">
            <Button
              disabled={isLoading}
              variant="ghost"
              onClick={onClose}
              className="font-semibold w-[140px]"
              asChild
            >
              <span>Cancel</span>
            </Button>
            <Button
              className="bg-customDarkBlue rounded-[20px] w-[140px] font-semibold"
              onClick={onUpdateTeamName}
              disabled={isLoading}
              asChild
              isLoading={isLoading}
            >
              Save
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default TeamNameDrawer;
