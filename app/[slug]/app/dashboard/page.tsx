"use client";
import { CreateOrganization, useOrganization } from "@clerk/nextjs";
import PromotionalCompaniesList from "../components/PromotionalCompaniesList";
import CalendarComponent from "../components/CalendarComponent";
import { CalendarLoading } from "../components/loading/CalendarLoading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Dashboard = () => {
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const router = useRouter();

  console.log("Organization Loaded:", orgLoaded);
  console.log("Organization Data:", organization);

  if (!orgLoaded) {
    return <CalendarLoading />;
  }

  if (!organization) {
    router.push("team-settings");
  }

  // if (organization && organization.name === "Admin") {
  //   return <PromotionalCompaniesList />;
  // }

  return <CalendarComponent />;
};

export default Dashboard;
