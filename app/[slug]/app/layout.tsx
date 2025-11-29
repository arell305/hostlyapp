"use client";

import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Sidebar from "@/shared/ui/nav/Sidebar";
import TicketScannerFAB from "@/shared/ui/fab/TicketScannerFAB";
import Navbar from "@/shared/ui/nav/Navbar";
import { isModerator } from "@/shared/utils/permissions";
import { useContextOrganization } from "@/shared/hooks/contexts/useContextOrganization";
import { useCleanLayout } from "@/shared/hooks/ui/useCleanLayout";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@/shared/types/constants";

const InnerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orgRole } = useContextOrganization();
  const canCheckInTickets = isModerator(orgRole);
  const isCleanLayout = useCleanLayout();

  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  const showNavbar = isCleanLayout || isDesktop;

  return (
    <div className="flex min-h-[100dvh] overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        {showNavbar && <Navbar className="fixed top-0 left-0 right-0 z-50" />}
        <main className={showNavbar ? "pt-[60px]" : "pt-2 md:pt-[60px]"}>
          {canCheckInTickets && <TicketScannerFAB />}
          {children}
        </main>
      </div>
    </div>
  );
};

const CompanyLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <OrganizationProvider>
      <InnerLayout>{children}</InnerLayout>
    </OrganizationProvider>
  );
};

export default CompanyLayout;
