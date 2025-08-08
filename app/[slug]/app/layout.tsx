"use client";

import {
  OrganizationProvider,
  useContextOrganization,
} from "@/contexts/OrganizationContext";
import Sidebar from "./components/shared/nav/Sidebar";
import TicketScannerFAB from "./components/ui/TicketScannerFAB";
import FullLoading from "./components/loading/FullLoading";
import Navbar from "./components/shared/nav/Navbar";
import { isModerator } from "@/utils/permissions";

const InnerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { orgRole, organizationContextLoading, organizationContextError } =
    useContextOrganization();

  const canCheckInTickets = isModerator(orgRole || "");

  if (organizationContextLoading) return <FullLoading />;
  if (organizationContextError)
    return <div className="p-6 text-red-500">{organizationContextError}</div>;

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
