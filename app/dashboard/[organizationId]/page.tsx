"use client";
import React from "react";
import { useParams } from "next/navigation";
import CalendarComponent from "../components/CalendarComponent";

const page = () => {
  const { organizationId } = useParams();
  console.log("organizationId", organizationId);
  if (!organizationId) {
    return <div>Loading...</div>; // or some other loading indicator
  }

  return <CalendarComponent organizationId={organizationId as string} />;
};

export default page;
