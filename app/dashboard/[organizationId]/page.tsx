"use client";
import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CalendarComponent from "../components/CalendarComponent";
import BackButton from "../components/BackButton";
import { useOrganization } from "@clerk/nextjs";

const page = () => {
  const { organizationId } = useParams();
  const { organization, isLoaded: orgClerkLoaded } = useOrganization();
  const searchParams = useSearchParams(); // Get search parameters
  const name = searchParams.get("name");

  if (!organizationId || !orgClerkLoaded) {
    return <div>Loading...</div>; // or some other loading indicator
  }

  if (organization?.name !== "Admin") {
    return <div>Unauthorized</div>;
  }

  return (
    <section>
      <div className="mb-4">
        <BackButton targetRoute="/" text="Back To Companies" />
      </div>
      <CalendarComponent
        organizationId={organizationId as string}
        companyName={name}
      />
    </section>
  );
};

export default page;
