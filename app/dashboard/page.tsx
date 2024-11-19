"use client";
import { CreateOrganization, useOrganization } from "@clerk/nextjs";
import PromotionalCompaniesList from "./components/PromotionalCompaniesList";
import CalendarComponent from "./components/CalendarComponent";
import { CalendarLoading } from "./components/loading/CalendarLoading";
import SuspenseBoundary from "@/components/layout/SuspenseBoundary";

const Dashboard = () => {
  <h1 className="mt-20">test</h1>;
  const { organization, isLoaded: orgLoaded } = useOrganization();

  if (!orgLoaded) {
    return <CalendarLoading />;
  }

  if (!organization) {
    return <CreateOrganization routing="virtual" />;
  }

  if (organization.name === "Admin") {
    return <PromotionalCompaniesList />;
  }

  return <CalendarComponent />;
};

export default Dashboard;
