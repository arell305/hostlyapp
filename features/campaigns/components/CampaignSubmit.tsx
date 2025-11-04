"use client";

import { useInsertCampaign } from "@/domain/campaigns";
import { useCampaignForm } from "../contexts/CampaignFormContext";
import SingleSubmitButton from "@/shared/ui/buttonContainers/SingleSubmitButton";
import { useUserScope } from "@/contexts/UserScope";
import { useRouter } from "next/navigation";
import { useContextOrganization } from "@/contexts/OrganizationContext";

const CampaignSubmit = () => {
  const router = useRouter();

  const { formData, isSubmitDisabled } = useCampaignForm();
  const { organization } = useContextOrganization();
  const { userId } = useUserScope();

  const { insertCampaign, insertCampaignLoading, insertCampaignError } =
    useInsertCampaign();

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }

    const { success, campaignId } = await insertCampaign({
      name: formData.name,
      userId: userId,
      eventId: formData.eventId,
      scheduleTime: formData.sendAt,
    });

    if (success) {
      router.push(
        `/${organization.slug}/app/campaigns/${userId}/${campaignId}`
      );
    }
  };

  return (
    <SingleSubmitButton
      isLoading={insertCampaignLoading}
      error={insertCampaignError}
      onClick={handleSubmit}
      disabled={insertCampaignLoading || isSubmitDisabled}
      label="Submit"
    />
  );
};

export default CampaignSubmit;
