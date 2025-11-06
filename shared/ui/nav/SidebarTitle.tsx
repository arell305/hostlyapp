"use client";

import { cn } from "@/shared/lib/utils";

interface SidebarTitleProps {
  title: string;
  className?: string;
}

const SidebarTitle: React.FC<SidebarTitleProps> = ({ title, className }) => {
  return (
    <div className={cn("my-2", className)}>
      <div className="h-px bg-borderGray " />
      <p className="text-xs font-medium text-grayText uppercase tracking-wider mt-2 px-1">
        {title}
      </p>
    </div>
  );
};

export default SidebarTitle;
