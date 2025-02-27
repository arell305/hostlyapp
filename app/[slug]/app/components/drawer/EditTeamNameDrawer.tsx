import BaseDrawer from "./BaseDrawer";
import { Input } from "@/components/ui/input";

interface EditTeamNameDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  onUpdateTeamName: () => void;
  error: string | null;
  isLoading: boolean;
  setTeamName: (name: string) => void;
  setTeamNameError: (error: string | null) => void;
}

const EditTeamNameDrawer: React.FC<EditTeamNameDrawerProps> = ({
  isOpen,
  onOpenChange,
  teamName,
  onUpdateTeamName,
  error,
  isLoading,
  setTeamName,
  setTeamNameError,
}) => {
  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Team Name"
      description={`Editing team name`}
      confirmText={isLoading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={onUpdateTeamName}
      error={error}
      isLoading={isLoading}
    >
      <div className="space-y-4 px-4">
        <Input
          type="text"
          placeholder="Enter Team Name"
          value={teamName}
          onChange={(e) => {
            setTeamName(e.target.value);
            setTeamNameError(null);
          }}
          className={error ? "border-red-500" : ""}
        />
      </div>
    </BaseDrawer>
  );
};

export default EditTeamNameDrawer;
