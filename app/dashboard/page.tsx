"use client";
import { CreateOrganization, useOrganization } from "@clerk/nextjs";
import PromotionalCompaniesList from "./components/PromotionalCompaniesList";
import CalendarComponent from "./components/CalendarComponent";
import { CalendarLoading } from "./components/loading/CalendarLoading";

const Dashboard = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();

  if (!orgLoaded) {
    return <CalendarLoading />;
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
