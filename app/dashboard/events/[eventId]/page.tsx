// "use client";
// import { useParams } from "next/navigation";
// import EventPage from "./EventPage";
// import { useQuery } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { useAuth } from "@clerk/nextjs";
// import { ClerkRoleEnum } from "@/utils/enums";
// import BackButton from "@/dashboard/components/BackButton";

// type ClerkRoleEnumType = (typeof ClerkRoleEnum)[keyof typeof ClerkRoleEnum];
// interface EventRolePermissions {
//   canUploadGuestList: boolean;
//   canViewAllGuestList: boolean;
//   canEdit: boolean;
//   canCheckInGuests: boolean;
// }

// export default function EventPageWrapper() {
//   const params = useParams();
//   const eventId = params.eventId as string;
//   const { orgRole, userId: promoterId, isLoaded, orgId } = useAuth();

//   const eventData = useQuery(api.events.getEventById, {
//     eventId,
//   });

//   const rolePermissions: Record<ClerkRoleEnumType, EventRolePermissions> = {
//     ORG_PROMOTER: {
//       canUploadGuestList: true,
//       canViewAllGuestList: false,
//       canEdit: false,
//       canCheckInGuests: false,
//     },
//     ORG_MANAGER: {
//       canUploadGuestList: false,
//       canViewAllGuestList: true,
//       canEdit: true,
//       canCheckInGuests: false,
//     },
//     ORG_ADMIN: {
//       canUploadGuestList: false,
//       canViewAllGuestList: false,
//       canEdit: true,
//       canCheckInGuests: true,
//     },
//     ORG_MODERATOR: {
//       canUploadGuestList: false,
//       canViewAllGuestList: false,
//       canEdit: false,
//       canCheckInGuests: true,
//     },
//   };

//   const isAdminOrg = orgId === "org_2n2ldgira5fU0dLmzYMJURwUXiK"; // Define the variable
//   const permissions = isAdminOrg
//     ? {
//         canUploadGuestList: false,
//         canViewAllGuestList: false,
//         canEdit: true,
//         canCheckInGuests: true,
//       }
//     : orgRole && rolePermissions[orgRole]
//       ? rolePermissions[orgRole]
//       : {
//           canUploadGuestList: false,
//           canViewAllGuestList: false,
//           canEdit: false,
//           canCheckInGuests: false,
//         };

//   if (eventData === undefined || !isLoaded) {
//     return <div>Loading</div>;
//   }

//   if (eventData === null) {
//     return <div>Event not found</div>;
//   }

//   if (
//     eventData.clerkOrganizationId !== orgId &&
//     !isAdminOrg // Check for admin organization
//   ) {
//     return <div>Unauthorized</div>;
//   }

//   const backRoute = isAdminOrg ? `/${eventData.clerkOrganizationId}` : "/";

//   return (
//     <section>
//       <BackButton text="Back To Calendar" targetRoute={backRoute} />
//       <EventPage
//         eventData={eventData}
//         permissions={permissions}
//         promoterId={promoterId || ""}
//       />
//     </section>
//   );
// }

"use client";
import { useParams, useSearchParams } from "next/navigation";
import EventPage from "./EventPage";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { ClerkRoleEnum } from "@/utils/enums";
import BackButton from "@/dashboard/components/BackButton";
import { useEffect } from "react";

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

  const { orgRole, userId: promoterId, isLoaded, orgId } = useAuth();

  const eventData = useQuery(api.events.getEventById, { eventId });

  // Check if the organization is the admin organization
  const isAdminOrg = orgId === "org_2n2ldgira5fU0dLmzYMJURwUXiK";

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

  const permissions = isAdminOrg
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
      />
    </section>
  );
}
