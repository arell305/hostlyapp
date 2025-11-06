"use client";

import { usePathname, useRouter } from "next/navigation";
import { useContextPublicOrganization } from "@/shared/hooks/contexts";
import CompanyEventsContent from "@/features/customerEvents/components/CompanyEventsContent";
import NProgress from "nprogress";

const CompanyEventsPage = () => {
  const context = useContextPublicOrganization();

  const router = useRouter();
  const pathname = usePathname();

  const handleNavigateEvent = (eventId: string) => {
    NProgress.start();
    router.push(`${pathname}/events/${eventId}`);
  };

  return (
    <CompanyEventsContent
      displayCompanyPhoto={context.organizationPublic.photoUrl}
      name={context.organizationPublic.name}
      events={context.organizationPublic.events}
      handleNavigateEvent={handleNavigateEvent}
    />
  );
};

export default CompanyEventsPage;
