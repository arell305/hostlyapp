"use client";

import PageContainer from "@/shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@/shared/ui/headings/SectionHeaderWithAction";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { Button } from "@shared/ui/primitive/button";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import CampaignFormContent from "./components/CampaignFormContent";
import { useCreateCampaignForm } from "./contexts/CampaignFormContext";

function stripAddSegment(path: string): string {
  return path.replace(/\/add\/?$/, "");
}

const AddCampaignPage = () => {
  const pathname = usePathname();
  const [confirmCancelModal, setConfirmCancelModal] = useState<boolean>(false);
  const router = useRouter();
  const { isFormDirty } = useCreateCampaignForm();

  const handleConfirmCancel = () => {
    setConfirmCancelModal(false);
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(stripAddSegment(pathname));
    }
  };

  const handleTriggerCancelModal = () => {
    console.log("handleTriggerCancelModal");
    setConfirmCancelModal(true);
  };

  const handleCancel = () => {
    if (isFormDirty) {
      handleTriggerCancelModal();
    } else {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(stripAddSegment(pathname));
      }
    }
  };
  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Add Campaign"
        actions={
          <Button onClick={handleCancel} variant="navGhost" size="nav">
            Cancel
          </Button>
        }
      />
      <CampaignFormContent triggerCancelModal={handleCancel} />
      <ResponsiveConfirm
        isOpen={confirmCancelModal}
        title="Confirm Cancel"
        confirmText="Cancel"
        cancelText="Cancel"
        confirmVariant="destructive"
        content="Are you sure you want to cancel? All data will be lost."
        error={null}
        isLoading={false}
        modalProps={{
          onClose: () => setConfirmCancelModal(false),
          onConfirm: handleConfirmCancel,
        }}
        drawerProps={{
          onSubmit: handleConfirmCancel,
          onOpenChange: setConfirmCancelModal,
        }}
      />
    </PageContainer>
  );
};

export default AddCampaignPage;
