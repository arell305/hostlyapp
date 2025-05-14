"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { handleQueryState } from "@/utils/handleQueryState";
import { api } from "convex/_generated/api";
import { QueryState } from "@/types/enums";
import AddGuestListContent from "./AddGuestListContent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import NProgress from "nprogress";

const AddGuestListPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { organization } = useContextOrganization();

  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  const result = handleQueryState(getEventByIdResponse);

  if (result.type === QueryState.Loading || result.type === QueryState.Error) {
    return result.element;
  }

  const eventData = result.data.event;

  const handleGoBack = () => {
    router.back();
  };

  const handleNavigateHome = () => {
    if (organization?.slug) {
      NProgress.start();
      router.push(`/${organization.slug}/app/`);
    }
  };

  if (!eventData.isActive) {
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
      eventData={eventData}
      handleGoBack={handleGoBack}
      handleNavigateHome={handleNavigateHome}
    />
  );
};

export default AddGuestListPage;
