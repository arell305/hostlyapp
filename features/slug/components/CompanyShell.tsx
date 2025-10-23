"use client";

import { useContextOrganization } from "@/contexts/OrganizationContext";
import Sidebar from "@/shared/ui/nav/Sidebar";
import TicketScannerFAB from "@/shared/ui/fab/TicketScannerFAB";
import Navbar from "@/shared/ui/nav/Navbar";
import { isModerator } from "@/shared/utils/permissions";

export default function CompanyShell({
  children,
}: {
  children: React.ReactNode;
}) {
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
}
