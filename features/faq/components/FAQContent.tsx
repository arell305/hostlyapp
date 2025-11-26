"use client";

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import FaqCard from "./FaqCard";
import { useContextOrganization } from "@/shared/hooks/contexts";
import { canCreateEvent } from "@/shared/utils/permissions";
import { useUpdateCompanyFaq } from "@/domain/faqs";
import ResponsiveConfirm from "@shared/ui/responsive/ResponsiveConfirm";
import ResponsiveEditFaq from "./ResponsiveEditFaq";
import CardContainer from "@/shared/ui/containers/CardContainer";

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

  const [faqToEdit, setFaqToEdit] = useState<Doc<"faq"> | null>(null);
  const [showEdit, setShowEdit] = useState<boolean>(false);

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

  const handleEdit = (faq: Doc<"faq">) => {
    setFaqToEdit(faq);
    setUpdateCompanyFaqError(null);
    setShowEdit(true);
  };

  if (faqs.length === 0) {
    return <p className="text-grayText">No faqs found.</p>;
  }

  return (
    <CardContainer>
      {faqs.map((faq) => (
        <FaqCard
          key={faq._id}
          faq={faq}
          showEditButton={canEditFAQ}
          onEdit={handleEdit}
          onDelete={showConfirmDeleteModal}
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

      <ResponsiveEditFaq
        isOpen={showEdit}
        onOpenChange={(open: boolean) => !open && setShowEdit(false)}
        faq={faqToEdit}
      />
    </CardContainer>
  );
};

export default FAQContent;
