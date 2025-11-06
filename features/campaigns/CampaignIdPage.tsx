"use client";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import { CampaignTab } from "@/shared/types/types";
import PageContainer from "@/shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@/shared/ui/headings/SectionHeaderWithAction";
import { useState } from "react";
import { useCampaignScope } from "@/shared/hooks/contexts/useCampaignScope";
import CampaignDetails from "./components/CampaignIdContent";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import { Archive, Pencil } from "lucide-react";
import { useUpdateCampaign } from "@/domain/campaigns";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";

const CampaignIdPage = () => {
  const { campaign } = useCampaignScope();
  const [selectedTab, setSelectedTab] = useState<CampaignTab>("messages");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

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
    }
  };

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title={`Campaign: ${campaign.name}`}
        actions={
          <div className="flex gap-2">
            <IconButton icon={<Pencil className="w-4 h-4" />} />
            <IconButton
              onClick={showConfirmDeleteModal}
              icon={<Archive className="w-4 h-4" />}
            />
          </div>
        }
      />
      <ToggleTabs
        options={[
          { label: "Messages", value: "messages" },
          { label: "Details", value: "details" },
        ]}
        value={selectedTab}
        onChange={setSelectedTab}
      />

      {selectedTab === "details" && <CampaignDetails isEditMode={isEditMode} />}
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
