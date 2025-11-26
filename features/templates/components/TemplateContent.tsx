"use client";

import { Doc, Id } from "@convex/_generated/dataModel";
import TemplateCard from "./TemplateCard";
import CardContainer from "@/shared/ui/containers/CardContainer";
import { useState } from "react";
import ResponsiveConfirm from "@/shared/ui/responsive/ResponsiveConfirm";
import { useDeleteSmsTemplate } from "@/domain/smsTemplates/useDeleteSmsTemplate";
import ResponsiveEditTemplate from "./ResponsiveEditTemplate";

interface TemplateContentProps {
  smsTemplates: Doc<"smsTemplates">[];
}

const TemplateContent = ({ smsTemplates }: TemplateContentProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<Id<"smsTemplates"> | null>(null);
  const [templateToEdit, setTemplateToEdit] =
    useState<Doc<"smsTemplates"> | null>(null);
  const [showEdit, setShowEdit] = useState<boolean>(false);

  const {
    deleteSmsTemplate,
    deleteSmsTemplateLoading,
    deleteSmsTemplateError,
  } = useDeleteSmsTemplate();

  const showConfirmDeleteModal = (templateId: Id<"smsTemplates">) => {
    setTemplateToDelete(templateId);
    setShowConfirmDelete(true);
  };

  const handleCloseConfirmDeleteModal = () => {
    setShowConfirmDelete(false);
    setTemplateToDelete(null);
  };

  const handleDelete = async (): Promise<void> => {
    if (!templateToDelete) {
      return;
    }
    const result = await deleteSmsTemplate({
      smsTemplateId: templateToDelete,
    });
    if (result) {
      handleCloseConfirmDeleteModal();
    }
  };

  const handleShowEditModal = (template: Doc<"smsTemplates">) => {
    setTemplateToEdit(template);
    setShowEdit(true);
  };

  const handleCloseEditModal = () => {
    setShowEdit(false);
    setTemplateToEdit(null);
  };

  if (smsTemplates.length === 0) {
    return <p className="text-grayText">No templates found.</p>;
  }

  return (
    <>
      <CardContainer>
        {smsTemplates.map((template) => (
          <TemplateCard
            key={template._id}
            template={template}
            onDelete={showConfirmDeleteModal}
            onEdit={handleShowEditModal}
          />
        ))}
      </CardContainer>
      <ResponsiveConfirm
        isOpen={showConfirmDelete}
        title="Confirm Deletion"
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        confirmVariant="destructive"
        content="Are you sure you want to delete this template? This action cannot be undone."
        error={deleteSmsTemplateError}
        isLoading={deleteSmsTemplateLoading}
        modalProps={{
          onClose: handleCloseConfirmDeleteModal,
          onConfirm: handleDelete,
        }}
        drawerProps={{
          onSubmit: handleDelete,
          onOpenChange: handleCloseConfirmDeleteModal,
        }}
      />
      {templateToEdit && (
        <ResponsiveEditTemplate
          isOpen={showEdit}
          onOpenChange={handleCloseEditModal}
          template={templateToEdit}
        />
      )}
    </>
  );
};

export default TemplateContent;
