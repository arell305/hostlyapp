"use client";

import CustomCard from "@shared/ui/cards/CustomCard";
import type { Doc } from "convex/_generated/dataModel";
import { useState } from "react";
import type { FaqValues } from "@shared/types/types";
import { FaqFields } from "./FAQFields";
import { InlineEditActions } from "@shared/ui/buttonContainers/InlineEditActions";
import FieldErrorMessage from "@shared/ui/error/FieldErrorMessage";
import FaqView from "./FaqView";

interface FaqCardProps {
  faq: Doc<"faq">;
  showEditButton?: boolean;
  onSave?: (
    faqId: Doc<"faq">["_id"],
    update: FaqValues
  ) => Promise<boolean | void>;
  onDelete?: (faqId: Doc<"faq">["_id"]) => void;
  isLoading: boolean;
  error?: string | null;
}

const FaqCard: React.FC<FaqCardProps> = ({
  faq,
  showEditButton = false,
  onSave,
  onDelete,
  isLoading,
  error,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>(faq.question);
  const [answer, setAnswer] = useState<string>(faq.answer);

  const canSave = question.trim().length > 0 && answer.trim().length > 0;

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => setIsEditing(false);

  const handleSave = async () => {
    if (!onSave || !canSave) {
      return;
    }

    const result = await onSave(faq._id, {
      question: question.trim(),
      answer: answer.trim(),
    });
    if (result) {
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(faq._id);
    }
  };

  return (
    <CustomCard className="group relative flex flex-col p-4">
      <InlineEditActions
        className="absolute right-2 top-2"
        isEditing={isEditing}
        canSave={canSave}
        isSaving={isLoading}
        showEditButton={showEditButton}
        onEdit={startEdit}
        onCancel={cancelEdit}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {isEditing ? (
        <>
          <FaqFields
            className="mt-4"
            values={{ question, answer }}
            onChange={(patch) => {
              if (patch.question !== undefined) setQuestion(patch.question);
              if (patch.answer !== undefined) setAnswer(patch.answer);
            }}
          />
          <FieldErrorMessage error={error} />
        </>
      ) : (
        <FaqView question={faq.question} answer={faq.answer} />
      )}
    </CustomCard>
  );
};

export default FaqCard;
