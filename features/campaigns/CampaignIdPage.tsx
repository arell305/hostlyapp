"use client";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import { CampaignTab } from "@/shared/types/types";
import PageContainer from "@/shared/ui/containers/PageContainer";
import { useState } from "react";
import { useCampaignScope } from "@/shared/hooks/contexts/useCampaignScope";
import { useUpdateCampaign } from "@/domain/campaigns";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { useRouter } from "next/navigation";
import { useContextOrganization } from "@/shared/hooks/contexts/useContextOrganization";
import { useUserScope } from "@/shared/hooks/contexts";
import CampaignNav from "./components/campaign/CampaignNav";
import CampaignIdContent from "./components/CampaignIdContent";
import MessagingTab from "./components/messages/MessagingTab";
import { Doc, Id } from "@/convex/_generated/dataModel";

const CampaignIdPage = () => {
  const router = useRouter();
  const { cleanSlug } = useContextOrganization();
  const { userId } = useUserScope();
  const { campaign } = useCampaignScope();
  const [selectedTab, setSelectedTab] = useState<CampaignTab>("messages");
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const showConfirmDeleteModal = () => {
    setShowConfirmDelete(true);
    setUpdateCampaignError(null);
  };

  const {
    updateCampaign,
    updateCampaignLoading,
    updateCampaignError,
    setUpdateCampaignError,
  } = useUpdateCampaign();

  const handleCloseConfirmDeleteModal = () => {
    setShowConfirmDelete(false);
    setUpdateCampaignError(null);
  };

  const handleDelete = async (): Promise<void> => {
    const success = await updateCampaign({
      campaignId: campaign._id,
      updates: { isActive: false },
    });

    if (success) {
      handleCloseConfirmDeleteModal();
      router.push(`/${cleanSlug}/app/campaigns/${userId}`);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = async () => {
    await updateCampaign({
      campaignId: campaign._id,
      updates: { status: "Cancelled" },
    });
  };

  return (
    <PageContainer>
      <CampaignNav
        campaign={campaign}
        onDelete={showConfirmDeleteModal}
        onEdit={handleEdit}
        onCancel={handleCancel}
      />
      <ToggleTabs
        options={[
          { label: "Messages", value: "messages" },
          { label: "Details", value: "details" },
        ]}
        value={selectedTab}
        onChange={setSelectedTab}
      />

      {selectedTab === "details" && <CampaignIdContent />}
      {selectedTab === "messages" && <MessagingTab />}
      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Confirm Archive"
        confirmText="Yes, Archive"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        content={
          "Are you sure you want to delete this campaign? All pending messages will be stopped."
        }
        error={updateCampaignError}
        isLoading={updateCampaignLoading}
        modalProps={{
          onClose: handleCloseConfirmDeleteModal,
          onConfirm: handleDelete,
        }}
      />
    </PageContainer>
  );
};

export default CampaignIdPage;
