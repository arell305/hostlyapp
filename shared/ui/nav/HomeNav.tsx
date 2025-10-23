"use client";

import Logo from "@/shared/ui/image/Logo";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { UserButton } from "@clerk/nextjs";

const HomeNav: React.FC = () => {
  const { userId } = useContextPublicOrganization();
  if (!userId) {
    return null;
  }

  return (
    <nav className="flex bg-cardBackground border-b w-full px-3">
      <div className="w-full max-w-screen-xl flex items-center justify-between px-2 h-12  mx-auto">
        <div className="flex items-center space-x-3">
          <Logo />
        </div>
        <UserButton />
      </div>
    </nav>
  );
};

export default HomeNav;
