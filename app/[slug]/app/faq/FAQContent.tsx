import React, { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import FaqCard from "./FaqCard";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { canCreateEvent } from "@/utils/permissions";
import { FaqValues } from "@/types/types";
import { useUpdateCompanyFaq } from "@/hooks/convex/faqs/useUpdateCompanyFaq";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";

interface FAQContentProps {
  faqs: Doc<"faq">[];
}

const FAQContent = ({ faqs }: FAQContentProps) => {
  const { orgRole } = useContextOrganization();
  const canEditFAQ = canCreateEvent(orgRole);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [faqIdToDelete, setFaqIdToDelete] = useState<Doc<"faq">["_id"] | null>(
    null
  );

  const {
    updateCompanyFaq,
    updateCompanyFaqLoading,
    updateCompanyFaqError,
    setUpdateCompanyFaqError,
  } = useUpdateCompanyFaq();

  const showConfirmDeleteModal = (faqId: Doc<"faq">["_id"]) => {
    setFaqIdToDelete(faqId);
    setShowConfirmDelete(true);
    setUpdateCompanyFaqError(null);
  };

  const handleCloseConfirmDeleteModal = () => {
    setShowConfirmDelete(false);
    setFaqIdToDelete(null);
    setUpdateCompanyFaqError(null);
  };

  const handleDelete = async (): Promise<void> => {
    if (!faqIdToDelete) {
      return;
    }
    const success = await updateCompanyFaq({
      faqId: faqIdToDelete,
      updates: { isActive: false },
    });
    if (success) {
      handleCloseConfirmDeleteModal();
    }
  };

  const handleSave = async (faqId: Doc<"faq">["_id"], update: FaqValues) => {
    const result = await updateCompanyFaq({
      faqId,
      updates: { ...update },
    });
    return result;
  };

  return (
    <div className="flex flex-col gap-4">
      {faqs.map((faq) => (
        <FaqCard
          key={faq._id}
          faq={faq}
          showEditButton={canEditFAQ}
          onSave={handleSave}
          onDelete={showConfirmDeleteModal}
          isLoading={updateCompanyFaqLoading}
          error={updateCompanyFaqError}
        />
      ))}
      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Confirm Deletion"
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        content={
          "Are you sure you want to delete this FAQ? This action cannot be undone."
        }
        error={updateCompanyFaqError}
        isLoading={updateCompanyFaqLoading}
        modalProps={{
          onClose: handleCloseConfirmDeleteModal,
          onConfirm: handleDelete,
        }}
      />
    </div>
  );
};

export default FAQContent;
