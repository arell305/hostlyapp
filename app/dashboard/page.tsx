"use client";
import {
  CreateOrganization,
  OrganizationList,
  OrganizationProfile,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";
import PromotionalCompaniesList from "./components/PromotionalCompaniesList";

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

  if (organization.name === "Admin") {
    return <PromotionalCompaniesList />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <Image
        src={organization.imageUrl}
        alt="imageUrl"
        width={20}
        height={20}
      />
    </div>
  );
};

export default Dashboard;
