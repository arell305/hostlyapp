"use client";

import CustomCard from "@shared/ui/cards/CustomCard";
import type { Doc, Id } from "convex/_generated/dataModel";
import FaqView from "./FaqView";
import ResponsiveFaqActions from "./ResponsiveFaqActions";

interface FaqCardProps {
  faq: Doc<"faq">;
  showEditButton?: boolean;
  onEdit: (faq: Doc<"faq">) => void;
  onDelete: (id: Id<"faq">) => void;
}

const FaqCard: React.FC<FaqCardProps> = ({
  faq,
  showEditButton = false,
  onEdit,
  onDelete,
}) => {
  return (
    <CustomCard className="group relative p-4 hover:shadow-md transition-shadow">
      <div className="pr-10">
        {" "}
        <FaqView question={faq.question} answer={faq.answer} />
      </div>

      {showEditButton && (
        <div className="absolute top-4 right-4">
          <ResponsiveFaqActions faq={faq} onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
    </CustomCard>
  );
};

export default FaqCard;
