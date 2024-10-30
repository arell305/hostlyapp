// // pages/events/[id].tsx
"use client";
import { useParams } from "next/navigation";
import EventPage from "./EventPage";
import { Id } from "../../../../convex/_generated/dataModel";
import { v } from "convex/values";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { ClerkRoleEnum } from "@/utils/enums";

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
  const { orgRole, userId: promoterId, isLoaded, orgId } = useAuth();

  const eventData = useQuery(api.events.getEventById, {
    eventId,
  });

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

  const permissions =
    orgId === "org_2n2ldgira5fU0dLmzYMJURwUXiK"
      ? {
          canUploadGuestList: false,
          canViewAllGuestList: false,
          canEdit: true,
          canCheckInGuests: true,
        }
      : orgRole && rolePermissions[orgRole]
        ? rolePermissions[orgRole]
        : {
            canUploadGuestList: false,
            canViewAllGuestList: false,
            canEdit: false,
            canCheckInGuests: false,
          };

  if (eventData === undefined || !isLoaded) {
    return <div>Loading</div>;
  }

  if (eventData === null) {
    return <div>Event not found</div>;
  }

  if (
    eventData.clerkOrganizationId !== orgId &&
    orgId !== "org_2n2ldgira5fU0dLmzYMJURwUXiK"
  ) {
    return <div>Unauthorized</div>;
  }

  return (
    <EventPage
      eventData={eventData}
      permissions={permissions}
      promoterId={promoterId}
    />
  );
}
