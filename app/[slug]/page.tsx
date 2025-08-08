"use client";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import CompanyEventsContent from "./app/components/CompanyEventsContent";
import NProgress from "nprogress";

const CompanyEvents = () => {
  const { name, photo, events } = useContextPublicOrganization();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigateEvent = (eventId: string) => {
    NProgress.start();
    router.push(`${pathname}/events/${eventId}`);
  };

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    photo ? { storageId: photo } : "skip"
  );

  return (
    <CompanyEventsContent
      displayCompanyPhoto={displayCompanyPhoto}
      name={name}
      events={events}
      handleNavigateEvent={handleNavigateEvent}
    />
  );
};

export default CompanyEvents;
