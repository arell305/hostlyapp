"use client";

import React from "react";

interface EditableImageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const EditableImageContainer: React.FC<EditableImageContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`flex justify-center mb-6 ${className || ""}`}>
      {children}
    </div>
  );
};

export default EditableImageContainer;
