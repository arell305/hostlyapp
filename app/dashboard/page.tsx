"use client";
import {
  CreateOrganization,
  OrganizationList,
  OrganizationProfile,
  useOrganization,
  useUser,
} from "@clerk/nextjs";

// app/dashboard/page.tsx

const Dashboard = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  if (!isLoaded || !orgLoaded) {
    return <div>Loading...</div>;
  }

  if (!organization) {
    return <CreateOrganization />;
  }

  return <div>Dashboard Page</div>;
};

export default Dashboard;
