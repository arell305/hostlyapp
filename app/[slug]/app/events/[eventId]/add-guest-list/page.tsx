"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import AddGuestListContent from "./AddGuestListContent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import NProgress from "nprogress";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";

const AddGuestListPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { cleanSlug } = useContextOrganization();

  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  if (!getEventByIdResponse) {
    return <FullLoading />;
  }

  const handleGoBack = () => {
    router.back();
  };

  const handleNavigateHome = () => {
    NProgress.start();
    router.push(`/${cleanSlug}/app/`);
  };

  if (!getEventByIdResponse.event.isActive) {
    return (
      <MessagePage
        buttonLabel="Home"
        onButtonClick={handleNavigateHome}
        title="Event Not Found"
        description="The event you are looking for does not exist."
      />
    );
  }

  return (
    <AddGuestListContent
      eventData={getEventByIdResponse.event}
      handleGoBack={handleGoBack}
      handleNavigateHome={handleNavigateHome}
    />
  );
};

export default AddGuestListPage;
