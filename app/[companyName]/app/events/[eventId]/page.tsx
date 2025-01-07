// "use client";
// import { useParams, useSearchParams } from "next/navigation";
// import EventPage from "./EventPage";
// import { useQuery } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { useAuth } from "@clerk/nextjs";
// import { ClerkRoleEnum } from "@/utils/enums";
// import BackButton from "@/dashboard/components/BackButton";
// import { useEffect, useState } from "react";
// import EventInfoSkeleton from "@/dashboard/components/loading/EventInfoSkeleton";
// import { UserRole } from "../../../../utils/enum";
// import TopRowNav from "./TopRowNav";
// import ConfirmModal from "@/dashboard/components/ConfirmModal";
"use client";
import EventInfoSkeleton from "@/[companyName]/app/components/loading/EventInfoSkeleton";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { ResponseStatus } from "../../../../../utils/enum";
import NotFound from "@/[companyName]/app/components/errors/NotFound";
import ErrorFetch from "@/[companyName]/app/components/errors/ErrorFetch";
import UnauthorizedComponent from "@/[companyName]/app/components/errors/Unauthorized";
import EventIdContent from "./EventIdContent";

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
//   const searchParams = useSearchParams(); // Get search parameters
//   const name = searchParams.get("name");
//   const data = useAuth();
//   const { orgRole, userId: promoterId, isLoaded, orgId, orgSlug } = useAuth();
//   const eventData = useQuery(api.events.getEventById, { eventId });
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [showConfirmCancelEdit, setShowConfirmCancelEdit] =
//     useState<boolean>(false);
//   const displayEventPhoto = useQuery(api.photo.getFileUrl, {
//     storageId: eventData?.photo ?? null,
//   });
//   // Check if the organization is the admin organization
//   const isAdminOrg = orgSlug === "admin";

//   // Query permissions based on role
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

//   let permissions =
//     isAdminOrg || orgRole === UserRole.Admin
//       ? {
//           canUploadGuestList: false,
//           canViewAllGuestList: true,
//           canEdit: true,
//           canCheckInGuests: false,
//           canModerateApp: false,
//         }
//       : orgRole && rolePermissions[orgRole]
//         ? rolePermissions[orgRole]
//         : {
//             canUploadGuestList: false,
//             canViewAllGuestList: false,
//             canEdit: false,
//             canCheckInGuests: false,
//             canModerateApp: false,
//           };

//   if (orgRole === UserRole.Promoter) {
//     permissions = {
//       canUploadGuestList: true,
//       canViewAllGuestList: false,
//       canEdit: false,
//       canCheckInGuests: false,
//       canModerateApp: false,
//     };
//   }

//   if (orgRole === "org:moderator") {
//     permissions = {
//       canUploadGuestList: false,
//       canViewAllGuestList: false,
//       canEdit: false,
//       canCheckInGuests: true,
//       canModerateApp: false,
//     };
//   }

//   if (isAdminOrg) {
//     permissions = {
//       canUploadGuestList: false,
//       canViewAllGuestList: true,
//       canEdit: false,
//       canCheckInGuests: false,
//       canModerateApp: true,
//     };
//   }

//   const handleCancelEdit = () => {
//     if (isEditing) {
//       setShowConfirmCancelEdit(true); // Show confirmation dialog
//     } else {
//       setIsEditing(false); // Just exit edit mode if not editing
//     }
//   };

//   if (eventData === undefined || !isLoaded || displayEventPhoto === undefined) {
//     return <EventInfoSkeleton />;
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

//   return (
//     <section className="container mx-auto p-4 md:border-2 max-w-3xl md:p-6 rounded-lg">
//       <TopRowNav
//         eventData={eventData}
//         isAdminOrg={true}
//         setIsEditing={setIsEditing}
//         isEditing={isEditing}
//         onCancelEdit={handleCancelEdit}
//       />
//       <EventPage
//         eventData={eventData}
//         permissions={permissions}
//         promoterId={promoterId || ""}
//         displayEventPhoto={displayEventPhoto}
//         setIsEditing={setIsEditing}
//         isEditing={isEditing}
//         onCancelEdit={handleCancelEdit}
//       />
//       <ConfirmModal
//         isOpen={showConfirmCancelEdit}
//         onClose={() => setShowConfirmCancelEdit(false)}
//         onConfirm={() => {
//           setShowConfirmCancelEdit(false);
//           setIsEditing(false);
//         }}
//         title="Confirm Cancellation"
//         message="Are you sure you want to cancel? Any unsaved changes will be discarded."
//         confirmText="Yes, Cancel"
//         cancelText="No, Continue Editing"
//       />
//     </section>
//   );
// }

export default function EventPageWrapper() {
  const { has } = useAuth();
  const params = useParams();
  const eventId = params.eventId as string;

  const { user, loaded, organization } = useClerk();
  const getEventByIdResponse = useQuery(api.events.getEventById, { eventId });

  const isAppAdmin = organization?.slug === "admin";

  // Check loading state
  if (!loaded || !has) {
    return <EventInfoSkeleton />;
  }

  // Check if the event data is undefined or has a specific status
  if (getEventByIdResponse === undefined) {
    return <EventInfoSkeleton />;
  }

  // // Check for various response statuses
  // if (getEventByIdResponse?.status === ResponseStatus.NOT_FOUND) {
  //   return <NotFound text={"event"} />;
  // }

  // if (getEventByIdResponse?.status === ResponseStatus.UNAUTHORIZED) {
  //   return <UnauthorizedComponent />;
  // }

  if (
    (getEventByIdResponse?.status === ResponseStatus.ERROR &&
      getEventByIdResponse.error) ||
    !user
  ) {
    return <ErrorFetch text={"event"} message={getEventByIdResponse.error} />;
  }

  // Ensure that data, isAppAdmin, and organization are all truthy
  const data = getEventByIdResponse.data;

  if (!data || !organization) {
    return <NotFound text={"event"} />; // Or handle it in another way
  }
  // Final return with all required props
  return (
    <EventIdContent
      data={data}
      isAppAdmin={isAppAdmin}
      organization={organization}
      user={user}
      has={has}
    />
  );
}
