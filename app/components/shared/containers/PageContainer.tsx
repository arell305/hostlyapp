"use client";

import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
}) => {
  return <div className={`space-y-6 pt-2 ${className}`}>{children}</div>;
};

export default PageContainer;
