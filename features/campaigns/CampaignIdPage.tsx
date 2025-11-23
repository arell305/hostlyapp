"use client";

import { useEffect, useState } from "react";
import ToggleTabs from "@/shared/ui/toggle/ToggleTabs";
import { CampaignTab } from "@/shared/types/types";
import PageContainer from "@/shared/ui/containers/PageContainer";
import { useCampaignScope } from "@/shared/hooks/contexts/useCampaignScope";
import { useUpdateCampaign } from "@/domain/campaigns";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { useRouter } from "next/navigation";
import { useContextOrganization } from "@/shared/hooks/contexts/useContextOrganization";
import { useUserScope } from "@/shared/hooks/contexts";
import CampaignNav from "./components/campaign/CampaignNav";
import CampaignIdContent from "./components/CampaignIdContent";
import MessagingTab from "./components/messages/MessagingTab";
import { useCampaignForm } from "@/shared/hooks/contexts/campaign/useCampaignForm";

const CampaignIdPage = () => {
  const router = useRouter();
  const { cleanSlug } = useContextOrganization();
  const { userId } = useUserScope();
  const { campaign, isEditing, setIsEditing } = useCampaignScope();
  const { hasChanges: hasCampaignUpdateChanges } = useCampaignForm();

  const initialTab: CampaignTab = isEditing ? "details" : "messages";
  const [selectedTab, setSelectedTab] = useState<CampaignTab>(initialTab);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [showConfirmMessagesCancel, setShowConfirmMessagesCancel] =
    useState<boolean>(false);

  const {
    updateCampaign,
    updateCampaignLoading,
    updateCampaignError,
    setUpdateCampaignError,
  } = useUpdateCampaign();

  useEffect(() => {
    if (isEditing) {
      setSelectedTab("details");
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleTabChange = (tab: CampaignTab) => {
    if (tab === "messages" && isEditing) {
      if (hasCampaignUpdateChanges) {
        setShowConfirmMessagesCancel(true);
      } else {
        setSelectedTab(tab);
        setIsEditing(false);
      }
    } else {
      setSelectedTab(tab);
    }
  };

  const handleConfirmDiscard = () => {
    setSelectedTab("messages");
    setIsEditing(false);
    setShowConfirmMessagesCancel(false);
  };

  const handleDelete = async () => {
    const success = await updateCampaign({
      campaignId: campaign._id,
      updates: { isActive: false },
    });
    if (success) {
      router.push(`/${cleanSlug}/app/campaigns/${userId}`);
    }
  };

  const handleCancel = () =>
    updateCampaign({
      campaignId: campaign._id,
      updates: { status: "Cancelled" },
    });
  const handleReactivate = () =>
    updateCampaign({ campaignId: campaign._id, updates: { isActive: true } });
  const handleResume = () =>
    updateCampaign({
      campaignId: campaign._id,
      updates: { status: "Scheduled" },
    });

  const handleOpenEvent = () => {
    if (campaign.eventId) {
      router.push(`/${cleanSlug}/app/events/${campaign.eventId}`);
    }
  };

  return (
    <PageContainer>
      <CampaignNav
        campaign={campaign}
        onDelete={() => setShowConfirmDelete(true)}
        onEdit={handleEdit}
        onCancel={handleCancel}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onReactivate={handleReactivate}
        onResume={handleResume}
        onOpenEvent={handleOpenEvent}
      />

      <ToggleTabs
        options={[
          { label: "Messages", value: "messages" },
          { label: "Details", value: "details" },
        ]}
        value={selectedTab}
        onChange={handleTabChange}
      />

      {selectedTab === "details" && <CampaignIdContent />}
      {selectedTab === "messages" && <MessagingTab />}

      {/* Archive Confirmation */}
      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Archive Campaign"
        confirmText="Yes, Archive"
        cancelText="Cancel"
        confirmVariant="destructive"
        content="This will stop all pending messages."
        error={updateCampaignError}
        isLoading={updateCampaignLoading}
        modalProps={{
          onClose: () => {
            setShowConfirmDelete(false);
            setUpdateCampaignError(null);
          },
          onConfirm: handleDelete,
        }}
      />

      {/* Discard Changes Confirmation */}
      <ResponsiveConfirm
        isOpen={showConfirmMessagesCancel}
        title="Discard Changes?"
        confirmText="Discard"
        cancelText="Stay"
        confirmVariant="destructive"
        content="You have unsaved changes. They will be lost if you leave."
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setShowConfirmMessagesCancel(false),
          onConfirm: handleConfirmDiscard,
        }}
        drawerProps={{
          onOpenChange: () => setShowConfirmMessagesCancel(false),
          onSubmit: handleConfirmDiscard,
        }}
      />
    </PageContainer>
  );
};

export default CampaignIdPage;
