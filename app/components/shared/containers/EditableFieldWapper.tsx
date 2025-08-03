import React from "react";
import { cn } from "@/lib/utils"; // optional, for merging className

interface EditableFieldWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const EditableFieldWrapper: React.FC<EditableFieldWrapperProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={cn("w-full border-b px-4 py-3", className)}>{children}</div>
  );
};

export default EditableFieldWrapper;
