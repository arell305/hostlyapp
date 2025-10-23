"use client";

import { cn } from "@/shared/lib/utils";

interface NavButtonsContainerProps {
  children: React.ReactNode;
  className?: string;
}

const NavButtonsContainer: React.FC<NavButtonsContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex justify-between my-2 px-2", className)}>
      {children}
    </div>
  );
};

export default NavButtonsContainer;
