"use client";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import EventIdContent from "./EventIdContent";
import FullLoading from "../../components/loading/FullLoading";
import ErrorComponent from "../../components/errors/ErrorComponent";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isAdmin, isHostlyUser, isManager } from "@/utils/permissions";
import { isModerator, isPromoter } from "@/utils/permissions";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { handleQueryState } from "@/utils/handleQueryState";
import { QueryState } from "@/types/enums";
import { GetEventByIdData } from "@/types/convex-types";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import NProgress from "nprogress";

export default function EventPageWrapper() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as Id<"events">;
  const {
    organization,
    organizationContextError,
    connectedAccountEnabled,
    subscription,
    availableCredits,
  } = useContextOrganization();

  const orgRole = user?.publicMetadata.role as string;
  const canCheckInGuests = isModerator(orgRole);
  const canUploadGuest = isPromoter(orgRole);
  const canEditEvent = isManager(orgRole);
  const isAppAdmin = isHostlyUser(orgRole);
  const isCompanyAdmin = isAdmin(orgRole);

  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  const handleNavigateHome = () => {
    if (organization?.slug) {
      NProgress.start();
      router.push(`/${organization.slug}/app/`);
    }
  };

  const handleAddGuestList = () => {
    if (organization?.slug) {
      NProgress.start();
      router.push(`/${organization.slug}/app/events/${eventId}/add-guest-list`);
    }
  };

  const handleBuyCredit = () => {
    if (organization?.slug) {
      NProgress.start();
      router.push(`/${organization.slug}/app/subscription`);
    }
  };

  const eventResult = handleQueryState(getEventByIdResponse);

  if (
    !organization ||
    !subscription ||
    connectedAccountEnabled === undefined ||
    !user ||
    eventResult.type === QueryState.Loading
  ) {
    return <FullLoading />;
  }

  if (organizationContextError) {
    return <ErrorComponent message={organizationContextError} />;
  }

  if (eventResult.type === QueryState.Error) {
    return eventResult.element;
  }

  const eventData: GetEventByIdData = eventResult.data;

  if (!eventData.event.isActive) {
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
    <EventIdContent
      isAppAdmin={isAppAdmin}
      isStripeEnabled={connectedAccountEnabled}
      subscription={subscription}
      handleNavigateHome={handleNavigateHome}
      canCheckInGuests={canCheckInGuests}
      canUploadGuest={canUploadGuest}
      canEditEvent={canEditEvent}
      handleAddGuestList={handleAddGuestList}
      handleBuyCredit={handleBuyCredit}
      data={eventData}
      isCompanyAdmin={isCompanyAdmin}
      availableCredits={availableCredits}
    />
  );
}
