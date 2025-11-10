"use client";
import { CampaignFormProvider } from "../contexts/CampaignFormContext";
import CampaignFormContent from "./CampaignFormContent";

interface CampaignFormProps {
  triggerCancelModal: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ triggerCancelModal }) => {
  return (
    <CampaignFormProvider>
      <CampaignFormContent triggerCancelModal={triggerCancelModal} />
    </CampaignFormProvider>
  );
};

export default CampaignForm;
