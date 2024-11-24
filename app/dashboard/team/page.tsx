// "use client";

// import { OrganizationProfile } from "@clerk/nextjs";
// import { FaTicket } from "react-icons/fa6";
// import OrgPromoCode from "./OrgPromoCode";

// const OrganizationProfilePage = () => (
//   <OrganizationProfile routing="hash">
//     <OrganizationProfile.Page
//       label="Team Promo Code"
//       labelIcon={<FaTicket />}
//       url="promoCode"
//     >
//       <OrgPromoCode />
//     </OrganizationProfile.Page>
//   </OrganizationProfile>
// );

// export default OrganizationProfilePage;
"use client";
import { useOrganization, useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { OrganizationMembership } from "@clerk/clerk-sdk-node";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Membership } from "@/types";
import MemberCard from "./MemberCard";
import { UserRole } from "../../../utils/enum";

const Team = () => {
  const { organization, isLoaded } = useOrganization();
  const { user, isLoaded: isUserLoaded } = useUser();
  const currentUserRole = user?.organizationMemberships[0].role as UserRole;
  console.log("info", user);
  const getOrganizationMembership = useAction(
    api.clerk.getOrganizationMemberships
  );
  const [organizationalMembership, setOrganizationalMembership] = useState<
    Membership[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const updateOrganizationMemberships = useAction(
    api.clerk.updateOrganizationMemberships
  );

  useEffect(() => {
    const fetchOrganizationalMembership = async () => {
      try {
        if (organization) {
          const result = await getOrganizationMembership({
            clerkOrgId: organization.id,
          });
          setOrganizationalMembership(result);
        }
      } catch (err) {
        console.error("Error fetching organizational memberships:", err);
        setError("Failed to fetch organizational memberships.");
      }
    };

    if (isLoaded && organization) {
      fetchOrganizationalMembership();
    }
  }, [getOrganizationMembership, organization, isLoaded]);

  const handleSaveRole = async (clerkUserId: string, role: UserRole) => {
    try {
      if (organization) {
        await updateOrganizationMemberships({
          clerkOrgId: organization.id,
          clerkUserId,
          role,
        });
      }
      setOrganizationalMembership((prevMemberships) =>
        prevMemberships.map((member) =>
          member.clerkUserId === clerkUserId ? { ...member, role } : member
        )
      );
    } catch (error) {
      console.log("err", error);
    }
  };

  const handleDelete = () => {
    // if (onDelete) {
    //   onDelete(clerkUserId); // Call the parent function to handle deletion
    // }
  };

  if (!isLoaded || !organization || !isUserLoaded || !user) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div>
      <h1>Team Members</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {organizationalMembership.map((member) => (
          <MemberCard
            key={member.clerkUserId} // Use userId as key
            firstName={member.firstName}
            lastName={member.lastName}
            role={member.role as UserRole}
            imageUrl={member.imageUrl || ""}
            clerkUserId={member.clerkUserId || ""}
            clerkOrgId={organization.id}
            onSaveRole={handleSaveRole}
            onDelete={handleDelete}
            isCurrentUser={user.id === member.clerkUserId}
            currentUserRole={currentUserRole}
          />
        ))}
      </div>
    </div>
  );
};

export default Team;
