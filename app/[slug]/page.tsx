"use client";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { useUser } from "@clerk/nextjs";
import CompanyEventsContent from "./app/components/CompanyEventsContent";
import FullLoading from "./app/components/loading/FullLoading";
import ErrorComponent from "./app/components/errors/ErrorComponent";
import NProgress from "nprogress";
const CompanyEvents = () => {
  const {
    name,
    photo,
    publicOrganizationContextError,
    organizationId,
    events,
  } = useContextPublicOrganization();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigateHome = () => {
    NProgress.start();
    router.push("/");
  };

  const handleNavigateEvent = (eventId: string) => {
    NProgress.start();
    router.push(`${pathname}/events/${eventId}`);
  };

  const displayCompanyPhoto = useQuery(
    api.photo.getFileUrl,
    photo ? { storageId: photo } : "skip"
  );

  if (publicOrganizationContextError) {
    return <ErrorComponent message={publicOrganizationContextError} />;
  }
  if (
    !organizationId ||
    user === undefined ||
    // displayCompanyPhoto === undefined
    events === undefined
  ) {
    return <FullLoading />;
  }

  return (
    <CompanyEventsContent
      user={user}
      displayCompanyPhoto={displayCompanyPhoto}
      handleNavigateHome={handleNavigateHome}
      name={name}
      events={events}
      handleNavigateEvent={handleNavigateEvent}
    />
  );
};

export default CompanyEvents;
