"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import AddGuestListContent from "./components/AddGuestListContent";
import {
  useContextOrganization,
  useEventIdScope,
} from "@/shared/hooks/contexts";
import MessagePage from "@shared/ui/shared-page/MessagePage";
import NProgress from "nprogress";
import FullLoading from "@shared/ui/loading/FullLoading";

const AddGuestListPage: React.FC = () => {
  const router = useRouter();
  const { eventId } = useEventIdScope();

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
