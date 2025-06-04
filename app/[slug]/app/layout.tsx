"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Sidebar from "./components/shared/nav/Sidebar";
import TicketScannerFAB from "./components/ui/TicketScannerFAB";
import FullLoading from "./components/loading/FullLoading";
import { isModerator } from "@/utils/permissions";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import Navbar from "./components/shared/nav/Navbar";
import { ResponseStatus } from "@/types/enums";
import ErrorComponent from "./components/errors/ErrorComponent";

const CompanyLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { slug } = useParams();
  const cleanSlug = typeof slug === "string" ? slug.split("?")[0] : "";

  const { user } = useUser();

  const userFromDb = useQuery(
    api.users.findUserByClerkId,
    user
      ? {
          clerkUserId: user.id,
        }
      : "skip"
  );

  if (!slug || !user || !userFromDb) {
    return <FullLoading />;
  }

  if (userFromDb.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={userFromDb.error} />;
  }

  if (!userFromDb.data.user.isActive) {
    return <ErrorComponent message="Your account is not active" />;
  }

  const orgRole = user.publicMetadata.role as string;
  const canCheckInTickets = isModerator(orgRole);
  const userData = userFromDb?.data?.user;
  return (
    <div className="flex min-h-[100dvh] overflow-hidden">
      <Sidebar slug={cleanSlug} orgRole={orgRole} />
      <div className="flex-1 lg:ml-64">
        <Navbar slug={cleanSlug} orgRole={orgRole} userData={userData} />
        <main className="pt-[72px]">
          <OrganizationProvider>
            {canCheckInTickets && <TicketScannerFAB />}
            {children}
          </OrganizationProvider>
        </main>
      </div>
    </div>
  );
};

const Home = ({ children }: { children: React.ReactNode }) => {
  return <CompanyLayout>{children}</CompanyLayout>;
};

export default Home;
