import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EventFormActionsProps {
  isEdit: boolean;
  isLoading: boolean;
  isUpdateLoading?: boolean;
  isDeleteLoading?: boolean;
  saveError?: string | null;
  deleteError?: string | null;
  onCancel: () => void;
  onDelete?: () => void;
}

const EventFormActions: React.FC<EventFormActionsProps> = ({
  isEdit,
  isLoading,
  isUpdateLoading,
  isDeleteLoading,
  saveError,
  deleteError,
  onCancel,
  onDelete,
}) => {
  return (
    <>
      {saveError && <p className="text-red-500 pl-4">{saveError}</p>}
      <div
        className={`w-full px-4 mt-12 flex justify-center ${
          isEdit
            ? "flex-col gap-y-3 mb-12 md:flex-row md:gap-x-10"
            : "flex-row gap-x-6 mb-6"
        }`}
      >
        {/* Cancel Button */}
        <Button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          size={isEdit ? "tripleButtons" : "doubelButtons"}
          variant="secondary"
          className="w-full md:w-[200px]"
        >
          {isEdit ? "Cancel Editing" : "Cancel"}
        </Button>

        {/* Submit Button (uses form submit context) */}
        <Button
          type="submit"
          disabled={isLoading || isUpdateLoading}
          size={isEdit ? "tripleButtons" : "doubelButtons"}
          variant="default"
          className="w-full md:w-[200px]"
          isLoading={isLoading || isUpdateLoading}
        >
          {isEdit ? "Update Event" : "Create"}
        </Button>

        {/* Delete Button */}
        {isEdit && onDelete && (
          <div className="w-full md:w-[200px]">
            <Button
              type="button"
              onClick={onDelete}
              size="tripleButtons"
              variant="secondary"
              className="w-full border-red-700 text-red-700"
              isLoading={isDeleteLoading}
            >
              Delete Event
            </Button>
            {deleteError && (
              <p className="text-red-500 text-sm mt-1">{deleteError}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default EventFormActions;
