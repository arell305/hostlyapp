import BaseDrawer from "./BaseDrawer";
import { Input } from "@/components/ui/input";

interface EditGuestNameDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editName: string;
  setEditName: (open: string) => void;
  error: string | null;
  isLoading: boolean;
  onSaveGuestName: () => Promise<void>;
  setEditNameError: (error: string | null) => void;
}
const EditGuestNameDrawer: React.FC<EditGuestNameDrawerProps> = ({
  isOpen,
  onOpenChange,
  editName,
  setEditName,
  error,
  isLoading,
  onSaveGuestName,
  setEditNameError,
}) => {
  return (
    <BaseDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Guest Name"
      description={`Editing guest name`}
      confirmText={isLoading ? "Saving..." : "Save"}
      cancelText="Cancel"
      onSubmit={onSaveGuestName}
      error={error}
      isLoading={isLoading}
    >
      <div className="space-y-4 px-4">
        <Input
          type="text"
          placeholder="Enter Team Name"
          value={editName}
          onChange={(e) => {
            setEditName(e.target.value);
            setEditNameError(null);
          }}
          className={error ? "border-red-500" : ""}
        />
      </div>
    </BaseDrawer>
  );
};

export default EditGuestNameDrawer;
