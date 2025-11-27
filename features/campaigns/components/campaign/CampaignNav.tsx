"use client";

import { Doc } from "@/convex/_generated/dataModel";
import IconButton from "@/shared/ui/buttonContainers/IconButton";
import TopBarContainer from "@/shared/ui/containers/TopBarContainer";
import CenteredTitle from "@/shared/ui/headings/CenteredTitle";
import { ArrowLeft, Pen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserScope, useContextOrganization } from "@/shared/hooks/contexts";
import ResponsiveCampaignActions from "../buttons/ResponsiveCampaignActions";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { useState } from "react";
import { useCampaignForm } from "@/shared/hooks/contexts/campaign/useCampaignForm";
import IconButtonContainer from "@/shared/ui/buttonContainers/IconButtonContainer";

interface CampaignNavProps {
  campaign: Doc<"campaigns">;
  onDelete: () => void;
  onEdit: () => void;
  onCancel: () => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onReactivate: () => void;
  onResume: () => void;
  onOpenEvent: () => void;
  onStop: () => void;
}
const CampaignNav = ({
  campaign,
  onDelete,
  onEdit,
  onCancel,
  isEditing,
  setIsEditing,
  onReactivate,
  onResume,
  onOpenEvent,
  onStop,
}: CampaignNavProps) => {
  const { userId } = useUserScope();
  const { cleanSlug } = useContextOrganization();
  const { hasChanges: hasCampaignUpdateChanges } = useCampaignForm();
  const [showConfirmCancelModal, setShowConfirmCancelModal] =
    useState<boolean>(false);
  const [showBackConfirmModal, setShowBackConfirmModal] =
    useState<boolean>(false);
  const router = useRouter();
  const handleGoBack = () => {
    if (isEditing && hasCampaignUpdateChanges) {
      setShowBackConfirmModal(true);
      return;
    }
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${cleanSlug}/app/campaigns/${userId}`);
    }
  };

  const handleEditCancel = () => {
    if (hasCampaignUpdateChanges) {
      setShowConfirmCancelModal(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleGoBackConfirm = () => {
    setShowBackConfirmModal(false);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${cleanSlug}/app/campaigns/${userId}`);
    }
  };

  const handleConfirmEditCancel = () => {
    setShowConfirmCancelModal(false);
    setIsEditing(false);
  };

  return (
    <TopBarContainer className="">
      {" "}
      <div className="">
        <IconButton
          icon={<ArrowLeft size={20} />}
          onClick={handleGoBack}
          title="Back"
          variant="ghost"
        />
      </div>
      <CenteredTitle title={campaign.name} />
      <div className=" flex justify-end">
        {isEditing ? (
          <IconButton
            icon={<X size={20} />}
            onClick={handleEditCancel}
            title="Cancel"
            variant="ghost"
          />
        ) : (
          <IconButtonContainer>
            <IconButton
              icon={<Pen size={20} />}
              onClick={onEdit}
              title="Edit"
              variant="ghost"
            />
            <ResponsiveCampaignActions
              campaign={campaign}
              onDelete={onDelete}
              onCancel={onCancel}
              onReactivate={onReactivate}
              onResume={onResume}
              onOpenEvent={onOpenEvent}
              onStop={onStop}
            />
          </IconButtonContainer>
        )}
      </div>
      <ResponsiveConfirm
        isOpen={showConfirmCancelModal}
        title="Confirm Cancel"
        confirmText="Cancel"
        cancelText="Cancel"
        confirmVariant="destructive"
        content="Are you sure you want to cancel? All data will be lost."
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setShowConfirmCancelModal(false),
          onConfirm: handleConfirmEditCancel,
        }}
        drawerProps={{
          onSubmit: handleConfirmEditCancel,
          onOpenChange: setShowConfirmCancelModal,
        }}
      />
      <ResponsiveConfirm
        isOpen={showBackConfirmModal}
        title="Confirm Go Back"
        confirmText="Cancel"
        cancelText="Go Back"
        confirmVariant="destructive"
        content="Are you sure you want to go back? All unsaved data will be lost."
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setShowBackConfirmModal(false),
          onConfirm: handleGoBackConfirm,
        }}
        drawerProps={{
          onSubmit: handleGoBackConfirm,
          onOpenChange: setShowBackConfirmModal,
        }}
      />
    </TopBarContainer>
  );
};

export default CampaignNav;
