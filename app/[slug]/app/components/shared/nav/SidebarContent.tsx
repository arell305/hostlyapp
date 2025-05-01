"use client";

import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  CreditCard,
  Settings,
  Home,
  BarChart,
  Banknote,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  isAdmin,
  isAdminOrHostlyAdmin,
  isAnalyticsUser,
  isHostlyUser,
  isManager,
} from "../../../../../../utils/permissions";
import Image from "next/image";
import Logo from "@/components/shared/Logo";
type SidebarContentProps = {
  onNavigate?: () => void;
  slug: string;
  orgRole: string;
};

const SidebarContent = ({ onNavigate, slug, orgRole }: SidebarContentProps) => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  const isAdminButton = isAdmin(orgRole);
  const isManagerButton = isManager(orgRole);
  const isAdminOrHostlyAdminButton = isAdminOrHostlyAdmin(orgRole);
  const isAnalyticsUserButton = isAnalyticsUser(orgRole);
  const isHostlyUserButton = isHostlyUser(orgRole);

  return (
    <nav className="flex flex-col  bg-cardBackground  h-screen ">
      {/* Static buttons */}
      <div className="h-14 flex items-center border-b">
        <Logo />
      </div>

      <div className="flex flex-col gap-2 md:gap-0 px-4 mt-2">
        {isHostlyUserButton && (
          <Button
            variant="sidebar"
            size="sidebar"
            onClick={() => handleNavigate(`/${slug}/app/companies`)}
          >
            <Building size={20} />
            Companies
          </Button>
        )}

        <Button
          variant="sidebar"
          size="sidebar"
          onClick={() => handleNavigate(`/${slug}/app`)}
        >
          <Home size={20} />
          Home
        </Button>
        <Button
          variant="sidebar"
          size="sidebar"
          onClick={() => handleNavigate(`/${slug}`)}
        >
          <Calendar size={20} />
          Customer Calendar
        </Button>
        <Button
          variant="sidebar"
          size="sidebar"
          onClick={() => handleNavigate(`/${slug}/app/team`)}
        >
          <Users size={20} />
          Team Members
        </Button>

        {isAnalyticsUserButton && (
          <Button
            variant="sidebar"
            size="sidebar"
            onClick={() => handleNavigate(`/${slug}/app/analytics`)}
          >
            <BarChart size={20} />
            Analytics
          </Button>
        )}

        {isManagerButton && (
          <Button
            variant="sidebar"
            size="sidebar"
            onClick={() => handleNavigate(`/${slug}/app/company-settings`)}
          >
            <Settings size={20} />
            Company Settings
          </Button>
        )}

        {isAdminButton && (
          <Button
            variant="sidebar"
            size="sidebar"
            onClick={() => handleNavigate(`/${slug}/app/stripe`)}
          >
            <Banknote size={20} />
            Stripe
          </Button>
        )}
        {isAdminOrHostlyAdminButton && (
          <Button
            variant="sidebar"
            size="sidebar"
            onClick={() => handleNavigate(`/${slug}/app/subscription`)}
          >
            <CreditCard size={20} />
            Subscription
          </Button>
        )}
      </div>
    </nav>
  );
};

export default SidebarContent;
