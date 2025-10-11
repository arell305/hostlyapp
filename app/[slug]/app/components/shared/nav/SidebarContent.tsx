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
  HelpCircle,
  FileText,
  MessageCircle,
} from "lucide-react";
import {
  isAdmin,
  isAdminOrHostlyAdmin,
  isAnalyticsUser,
  isHostlyUser,
  isManager,
} from "@/utils/permissions";
import Logo from "@/components/shared/Logo";
import _ from "lodash";
import NavLink from "./NavLink";
import { useContextOrganization } from "@/contexts/OrganizationContext";

type SidebarContentProps = {
  onNavigate?: () => void;
};

const SidebarContent = ({ onNavigate }: SidebarContentProps) => {
  const { orgRole, cleanSlug: slug, user } = useContextOrganization();

  const userId = user?._id;
  const isAdminButton = isAdmin(orgRole);
  const isManagerButton = isManager(orgRole);
  const isAdminOrHostlyAdminButton = isAdminOrHostlyAdmin(orgRole);
  const isAnalyticsUserButton = isAnalyticsUser(orgRole);
  const isHostlyUserButton = isHostlyUser(orgRole);

  const shouldHideMainButtons = slug === "admin" && isHostlyUserButton;

  // ---------- HREFS ----------
  const baseRoot = `/${slug}`;
  const baseApp = `${baseRoot}/app`;
  const maybeUser = (path: string) =>
    isHostlyUserButton ? `${baseApp}/${path}/` : `${baseApp}/${path}/${userId}`;

  const hrefs = {
    // hostly-only
    companies: `/admin/app/companies`,
    adminTeam: `/admin/app/team`,

    // main
    home: `${baseApp}`,
    customerCalendar: `${baseRoot}`,
    team: `${baseApp}/team`,
    analytics: `${baseApp}/analytics`,
    companySettings: `${baseApp}/company-settings`,
    stripe: `${baseApp}/stripe`,
    subscription: `${baseApp}/subscription`,
    faq: `${baseApp}/faq`,

    // per-user or org-wide
    templates: maybeUser("templates"),
    campaigns: maybeUser("campaigns"),
    contacts: maybeUser("contacts"),
  } as const;

  return (
    <nav className="flex flex-col bg-cardBackground h-screen">
      <div className="h-12 flex items-center border-b pl-4">
        <Logo />
      </div>

      <div className="flex flex-col gap-2 md:gap-0 px-4 mt-2">
        {isHostlyUserButton && (
          <div className="border-b-2">
            <NavLink href={hrefs.companies} onNavigate={onNavigate}>
              <Building size={20} />
              Companies
            </NavLink>
            <NavLink href={hrefs.adminTeam} onNavigate={onNavigate}>
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

            <NavLink href={hrefs.home} onNavigate={onNavigate}>
              <Home size={20} />
              Home
            </NavLink>

            <NavLink href={hrefs.customerCalendar} onNavigate={onNavigate}>
              <Calendar size={20} />
              Customer Calendar
            </NavLink>

            <NavLink href={hrefs.team} onNavigate={onNavigate}>
              <Users size={20} />
              Team Members
            </NavLink>

            {isAnalyticsUserButton && (
              <NavLink href={hrefs.analytics} onNavigate={onNavigate}>
                <BarChart size={20} />
                Analytics
              </NavLink>
            )}

            {isManagerButton && (
              <NavLink href={hrefs.companySettings} onNavigate={onNavigate}>
                <Settings size={20} />
                Company Settings
              </NavLink>
            )}

            {isAdminButton && (
              <NavLink href={hrefs.stripe} onNavigate={onNavigate}>
                <Banknote size={20} />
                Stripe
              </NavLink>
            )}

            {isAdminOrHostlyAdminButton && (
              <NavLink href={hrefs.subscription} onNavigate={onNavigate}>
                <CreditCard size={20} />
                Subscription
              </NavLink>
            )}

            <NavLink href={hrefs.faq} onNavigate={onNavigate}>
              <HelpCircle size={20} />
              FAQ
            </NavLink>

            <NavLink href={hrefs.templates} onNavigate={onNavigate}>
              <FileText size={20} />
              Templates
            </NavLink>

            <NavLink href={hrefs.campaigns} onNavigate={onNavigate}>
              <MessageCircle size={20} />
              Campaigns
            </NavLink>

            <NavLink href={hrefs.contacts} onNavigate={onNavigate}>
              <Users size={20} />
              Contacts
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default SidebarContent;
