"use client";
import { useParams, useSearchParams } from "next/navigation";
import EventPage from "./EventPage";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { ClerkRoleEnum } from "@/utils/enums";
import BackButton from "@/dashboard/components/BackButton";
import { useEffect } from "react";
import EventInfoSkeleton from "@/dashboard/components/loading/EventInfoSkeleton";

type ClerkRoleEnumType = (typeof ClerkRoleEnum)[keyof typeof ClerkRoleEnum];
interface EventRolePermissions {
  canUploadGuestList: boolean;
  canViewAllGuestList: boolean;
  canEdit: boolean;
  canCheckInGuests: boolean;
}

export default function EventPageWrapper() {
  const params = useParams();
  const eventId = params.eventId as string;
  const searchParams = useSearchParams(); // Get search parameters
  const name = searchParams.get("name");

  const { orgRole, userId: promoterId, isLoaded, orgId, orgSlug } = useAuth();
  const eventData = useQuery(api.events.getEventById, { eventId });

  const displayEventPhoto = useQuery(api.photo.getFileUrl, {
    storageId: eventData?.photo ?? null,
  });

  // Check if the organization is the admin organization
  const isAdminOrg = orgSlug === "admin";

  // Query permissions based on role
  const rolePermissions: Record<ClerkRoleEnumType, EventRolePermissions> = {
    ORG_PROMOTER: {
      canUploadGuestList: true,
      canViewAllGuestList: false,
      canEdit: false,
      canCheckInGuests: false,
    },
    ORG_MANAGER: {
      canUploadGuestList: false,
      canViewAllGuestList: true,
      canEdit: true,
      canCheckInGuests: false,
    },
    ORG_ADMIN: {
      canUploadGuestList: false,
      canViewAllGuestList: false,
      canEdit: true,
      canCheckInGuests: true,
    },
    ORG_MODERATOR: {
      canUploadGuestList: false,
      canViewAllGuestList: false,
      canEdit: false,
      canCheckInGuests: true,
    },
  };

  let permissions =
    isAdminOrg || orgRole === "org:admin"
      ? {
          canUploadGuestList: false,
          canViewAllGuestList: true,
          canEdit: true,
          canCheckInGuests: false,
        }
      : orgRole && rolePermissions[orgRole]
        ? rolePermissions[orgRole]
        : {
            canUploadGuestList: false,
            canViewAllGuestList: false,
            canEdit: false,
            canCheckInGuests: false,
          };

  if (orgRole === "org:promoter") {
    permissions = {
      canUploadGuestList: true,
      canViewAllGuestList: false,
      canEdit: false,
      canCheckInGuests: false,
    };
  }

  if (orgRole === "org:moderator") {
    permissions = {
      canUploadGuestList: false,
      canViewAllGuestList: false,
      canEdit: false,
      canCheckInGuests: true,
    };
  }

  if (isAdminOrg) {
    permissions = {
      canUploadGuestList: false,
      canViewAllGuestList: true,
      canEdit: false,
      canCheckInGuests: false,
    };
  }
  if (eventData === undefined || !isLoaded || displayEventPhoto === undefined) {
    return <EventInfoSkeleton />;
  }

  if (eventData === null) {
    return <div>Event not found</div>;
  }

  if (
    eventData.clerkOrganizationId !== orgId &&
    !isAdminOrg // Check for admin organization
  ) {
    return <div>Unauthorized</div>;
  }

  const backRoute = isAdminOrg ? `/${eventData.clerkOrganizationId}` : "/";

  return (
    <section>
      <BackButton
        text={name ? `Back to ${name}'s Calendar` : "Back To Calendar"}
        targetRoute={backRoute}
      />
      <EventPage
        eventData={eventData}
        permissions={permissions}
        promoterId={promoterId || ""}
        displayEventPhoto={displayEventPhoto}
      />
    </section>
  );
}
