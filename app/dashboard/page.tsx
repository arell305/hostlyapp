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
import CalendarComponent from "./components/CalendarComponent";

// app/dashboard/page.tsx

const Dashboard = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  if (!isLoaded || !orgLoaded) {
    return <div>Loading...</div>;
  }

  if (!organization) {
    return <CreateOrganization routing="hash" />;
  }

  if (organization.name === "Admin") {
    return <PromotionalCompaniesList />;
  }

  return (
    <div>
      <CalendarComponent />
    </div>
  );
};

export default Dashboard;
