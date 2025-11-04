import { useCampaignForm } from "../../contexts/CampaignFormContext";

const NoEventSelected = () => {
  const { updateFormData, nextStep } = useCampaignForm();
  const handleNoEvent = () => {
    updateFormData({ eventId: null });
    nextStep();
  };

  return (
    <div className=" ">
      <p className="text-muted-foreground mb-6">
        This campaign will not be associated with an event. You will not be able
        to use event tags.
      </p>
      <button
        onClick={handleNoEvent}
        className="px-6 py-2 border border-border rounded-md hover:bg-cardBackgroundHover transition-colors"
      >
        Continue Without Event
      </button>
    </div>
  );
};

export default NoEventSelected;
