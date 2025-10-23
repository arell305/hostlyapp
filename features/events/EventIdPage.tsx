"use client";
import { useRouter } from "next/navigation";
import EventIdContent from "@/features/events/components/EventIdContent";
import FullLoading from "@shared/ui/loading/FullLoading";
import { useContextOrganization } from "@/contexts/OrganizationContext";
import { isAdmin, isHostlyUser, isManager } from "@/shared/utils/permissions";
import { isModerator, isPromoter } from "@/shared/utils/permissions";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import MessagePage from "@shared/ui/shared-page/MessagePage";
import NProgress from "nprogress";
import { useEventIdScope } from "@/contexts/EventIdScope";

export default function EventIdPage() {
  const { eventId } = useEventIdScope();
  const router = useRouter();

  const {
    connectedAccountEnabled,
    subscription,
    availableCredits,
    orgRole,
    cleanSlug,
  } = useContextOrganization();

  const canCheckInGuests = isModerator(orgRole);
  const canUploadGuest = isPromoter(orgRole);
  const canEditEvent = isManager(orgRole);
  const isAppAdmin = isHostlyUser(orgRole);
  const isCompanyAdmin = isAdmin(orgRole);

  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  const handleNavigateHome = () => {
    NProgress.start();
    router.push(`/${cleanSlug}/app/`);
  };

  const handleAddGuestList = () => {
    NProgress.start();
    router.push(`/${cleanSlug}/app/events/${eventId}/add-guest-list`);
  };

  const handleBuyCredit = () => {
    NProgress.start();
    router.push(`/${cleanSlug}/app/subscription`);
  };

  const handleDeleteSuccess = () => {
    NProgress.start();
    router.push(`/${cleanSlug}/app`);
  };

  if (!getEventByIdResponse) {
    return <FullLoading />;
  }

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
  const event = getEventByIdResponse.event;

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
      data={{
        event,
        ticketTypes: getEventByIdResponse.ticketTypes,
        guestListInfo: getEventByIdResponse.guestListInfo,
        ticketSoldCounts: getEventByIdResponse.ticketSoldCounts,
      }}
      isCompanyAdmin={isCompanyAdmin}
      availableCredits={availableCredits}
      onDeleteSuccess={handleDeleteSuccess}
    />
  );
}
