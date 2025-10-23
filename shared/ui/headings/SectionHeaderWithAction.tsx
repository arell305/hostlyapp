"use client";

import { cn } from "@/shared/lib/utils";

interface SectionHeaderWithActionProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

const SectionHeaderWithAction: React.FC<SectionHeaderWithActionProps> = ({
  title,
  actions,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between w-full ", className)}>
      <h1>{title}</h1>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default SectionHeaderWithAction;
