"use client";
import { CampaignFormProvider } from "../contexts/CampaignFormContext";
import CampaignFormContent from "./CampaignFormContent";

const CampaignForm = () => {
  return (
    <CampaignFormProvider>
      <CampaignFormContent />
    </CampaignFormProvider>
  );
};

export default CampaignForm;
