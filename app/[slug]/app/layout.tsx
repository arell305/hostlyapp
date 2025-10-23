"use client";

import {
  OrganizationProvider,
  useContextOrganization,
} from "@/contexts/OrganizationContext";
import Sidebar from "@/shared/ui/nav/Sidebar";
import TicketScannerFAB from "@/shared/ui/fab/TicketScannerFAB";
import Navbar from "@/shared/ui/nav/Navbar";
import { isModerator } from "@/shared/utils/permissions";

const InnerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orgRole } = useContextOrganization();

  const canCheckInTickets = isModerator(orgRole || "");

  return (
    <div className="flex min-h-[100dvh] overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <main className="pt-[60px]">
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
