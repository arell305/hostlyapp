"use client";

import { useInsertCampaign } from "@/domain/campaigns";
import { useCreateCampaignForm } from "../contexts/CampaignFormContext";
import { useRouter } from "next/navigation";
import { useContextOrganization, useUserScope } from "@/shared/hooks/contexts";
import FormActions from "@/shared/ui/buttonContainers/FormActions";

const CampaignSubmit = () => {
  const router = useRouter();

  const { formData, isSubmitDisabled, prevStep } = useCreateCampaignForm();
  const { organization } = useContextOrganization();
  const { userId } = useUserScope();

  const { insertCampaign, insertCampaignLoading, insertCampaignError } =
    useInsertCampaign();

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }

    if (formData.eventId === undefined || !formData.body) {
      return;
    }

    const { success, campaignId } = await insertCampaign({
      name: formData.name,
      userId: userId,
      eventId: formData.eventId,
      scheduleTime: formData.sendAt,
      smsBody: formData.body,
      audienceType: formData.audienceType,
      enableAiReplies: formData.enableAiReplies,
      includeFaqInAiReplies: formData.includeFaqInAiReplies,
      aiPrompt: formData.aiPrompt,
    });

    if (success) {
      router.push(
        `/${organization.slug}/app/campaigns/${userId}/${campaignId}`
      );
    }
  };

  return (
    <FormActions
      onCancel={prevStep}
      onSubmit={handleSubmit}
      isSubmitDisabled={isSubmitDisabled}
      isLoading={insertCampaignLoading}
      error={insertCampaignError}
      cancelText="Back"
      submitText="Submit"
      cancelVariant="secondary"
      submitVariant="default"
      className="mt-16"
    />
  );
};

export default CampaignSubmit;
