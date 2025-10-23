// components/shared/containers/SubPageContainer.tsx

import React from "react";

interface SubPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SubPageContainer: React.FC<SubPageContainerProps> = ({
  children,
  className = "",
}) => {
  return <div className={`mt-4 ${className}`}>{children}</div>;
};

export default SubPageContainer;
