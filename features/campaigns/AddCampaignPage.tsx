"use client";

import PageContainer from "@/shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@/shared/ui/headings/SectionHeaderWithAction";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { Button } from "@shared/ui/primitive/button";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import CampaignForm from "./components/CampaignForm";

function stripAddSegment(path: string): string {
  return path.replace(/\/add\/?$/, "");
}

const AddCampaignPage = () => {
  const pathname = usePathname();
  const [confirmCancelModal, setConfirmCancelModal] = useState<boolean>(false);
  const router = useRouter();

  const handleConfirmCancel = () => {
    setConfirmCancelModal(false);
    router.push(stripAddSegment(pathname));
  };

  const handleTriggerCancelModal = () => {
    setConfirmCancelModal(true);
  };
  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Add Campaign"
        actions={
          <Button
            onClick={handleTriggerCancelModal}
            variant="navGhost"
            size="nav"
          >
            Cancel
          </Button>
        }
      />
      <CampaignForm triggerCancelModal={handleTriggerCancelModal} />
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
