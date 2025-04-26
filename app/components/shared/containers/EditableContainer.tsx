import React from "react";
import { cn } from "@/lib/utils";

interface EditableContainerProps {
  children: React.ReactNode;
  className?: string;
}

const EditableContainer: React.FC<EditableContainerProps> = ({
  children,
  className = "",
}) => {
  return <div className={cn("", className)}>{children}</div>;
};

export default EditableContainer;
