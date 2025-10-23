import { Button } from "@shared/ui/primitive/button";

interface EventFormActionsProps {
  isEdit: boolean;
  isLoading: boolean;
  isUpdateLoading?: boolean;
  saveError?: string | null;
  onCancel: () => void;
  isSubmitDisabled?: boolean;
  onSubmit: () => void;
}

const EventFormActions: React.FC<EventFormActionsProps> = ({
  isEdit,
  isLoading,
  isUpdateLoading,
  saveError,
  onCancel,
  isSubmitDisabled,
  onSubmit,
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
          size="doubelButtons"
          variant="secondary"
          className="w-full "
        >
          {isEdit ? "Cancel Editing" : "Cancel"}
        </Button>

        {/* Submit Button (uses form submit context) */}
        <Button
          onClick={onSubmit}
          disabled={isLoading || isUpdateLoading || isSubmitDisabled}
          size="doubelButtons"
          variant="default"
          className="w-full "
          isLoading={isLoading || isUpdateLoading}
        >
          {isEdit ? "Update Event" : "Create"}
        </Button>
      </div>
    </>
  );
};

export default EventFormActions;
