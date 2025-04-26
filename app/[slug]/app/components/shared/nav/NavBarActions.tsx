"use client";

import { useEffect, useState } from "react";

import { UserButton } from "@clerk/nextjs";

interface NavbarActionsProps {
  slug: string;
  orgRole: string;
}

const NavbarActions = ({ slug, orgRole }: NavbarActionsProps) => {
  const [showUserButton, setShowUserButton] = useState<boolean>(false);

  // Delay UserButton display to prevent layout shift
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUserButton(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8">
        {showUserButton ? (
          <UserButton />
        ) : (
          <div className="h-full w-full rounded-full bg-gray-700 animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default NavbarActions;
