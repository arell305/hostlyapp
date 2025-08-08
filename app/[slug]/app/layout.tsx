"use client";

import {
  OrganizationProvider,
  useContextOrganization,
} from "@/contexts/OrganizationContext";
import Sidebar from "./components/shared/nav/Sidebar";
import TicketScannerFAB from "./components/ui/TicketScannerFAB";
import Navbar from "./components/shared/nav/Navbar";
import { isModerator } from "@/utils/permissions";

const InnerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orgRole } = useContextOrganization();

  const canCheckInTickets = isModerator(orgRole || "");

  return (
    <div className="flex min-h-[100dvh] overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <main className="pt-[72px]">
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
