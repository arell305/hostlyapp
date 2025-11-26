"use client";
import { useSearchParams } from "next/navigation";
import { CreateCampaignFormProvider } from "../contexts/CampaignFormContext";
import { Id } from "@/convex/_generated/dataModel";
import AddCampaignPage from "../AddCampaignPage";

const AddCampaignProvider = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") as Id<"events">;

  return (
    <CreateCampaignFormProvider initialEventId={eventId}>
      <AddCampaignPage />
    </CreateCampaignFormProvider>
  );
};

export default AddCampaignProvider;
