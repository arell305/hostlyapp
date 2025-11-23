"use client";
import { useSearchParams } from "next/navigation";
import { CampaignFormProvider } from "../contexts/CampaignFormContext";
import CampaignFormContent from "./CampaignFormContent";
import { Id } from "@/convex/_generated/dataModel";

interface CampaignFormProps {
  triggerCancelModal: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ triggerCancelModal }) => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") as Id<"events">;

  return (
    <CampaignFormProvider initialEventId={eventId}>
      <CampaignFormContent triggerCancelModal={triggerCancelModal} />
    </CampaignFormProvider>
  );
};

export default CampaignForm;
