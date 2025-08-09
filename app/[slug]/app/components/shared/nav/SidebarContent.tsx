"use client";

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
import {
  isAdmin,
  isAdminOrHostlyAdmin,
  isAnalyticsUser,
  isHostlyUser,
  isManager,
} from "../../../../../../utils/permissions";
import Logo from "@/components/shared/Logo";
import _ from "lodash";
import NavLink from "./NavLink";
import { useContextOrganization } from "@/contexts/OrganizationContext";

type SidebarContentProps = {
  onNavigate?: () => void;
};

const SidebarContent = ({ onNavigate }: SidebarContentProps) => {
  const { orgRole, cleanSlug: slug } = useContextOrganization();
  const isAdminButton = isAdmin(orgRole);
  const isManagerButton = isManager(orgRole);
  const isAdminOrHostlyAdminButton = isAdminOrHostlyAdmin(orgRole);
  const isAnalyticsUserButton = isAnalyticsUser(orgRole);
  const isHostlyUserButton = isHostlyUser(orgRole);

  const shouldHideMainButtons = slug === "admin" && isHostlyUserButton;

  return (
    <nav className="flex flex-col bg-cardBackground h-screen">
      {/* Static header */}
      <div className="h-12 flex items-center border-b md:pl-4">
        <Logo />
      </div>

      <div className="flex flex-col gap-2 md:gap-0 px-4 mt-2">
        {/* Only for hostly users */}
        {isHostlyUserButton && (
          <div className="border-b-2">
            <NavLink href={`/admin/app/companies`} onNavigate={onNavigate}>
              <Building size={20} />
              Companies
            </NavLink>

            <NavLink href={`/admin/app/team`} onNavigate={onNavigate}>
              <Users size={20} />
              Admin Members
            </NavLink>
          </div>
        )}

        {!shouldHideMainButtons && (
          <>
            {isHostlyUserButton && (
              <p className="text-xl text-grayText pl-4 pt-2">
                {_.toUpper(slug)}
              </p>
            )}

            <NavLink href={`/${slug}/app`} onNavigate={onNavigate}>
              <Home size={20} />
              Home
            </NavLink>

            <NavLink href={`/${slug}`} onNavigate={onNavigate}>
              <Calendar size={20} />
              Customer Calendar
            </NavLink>

            <NavLink href={`/${slug}/app/team`} onNavigate={onNavigate}>
              <Users size={20} />
              Team Members
            </NavLink>

            {isAnalyticsUserButton && (
              <NavLink href={`/${slug}/app/analytics`} onNavigate={onNavigate}>
                <BarChart size={20} />
                Analytics
              </NavLink>
            )}

            {isManagerButton && (
              <NavLink
                href={`/${slug}/app/company-settings`}
                onNavigate={onNavigate}
              >
                <Settings size={20} />
                Company Settings
              </NavLink>
            )}

            {isAdminButton && (
              <NavLink href={`/${slug}/app/stripe`} onNavigate={onNavigate}>
                <Banknote size={20} />
                Stripe
              </NavLink>
            )}

            {isAdminOrHostlyAdminButton && (
              <NavLink
                href={`/${slug}/app/subscription`}
                onNavigate={onNavigate}
              >
                <CreditCard size={20} />
                Subscription
              </NavLink>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default SidebarContent;
