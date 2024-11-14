"use client";
import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import CalendarComponent from "../components/CalendarComponent";
import BackButton from "../components/BackButton";
import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const page = () => {
  const { organizationId } = useParams();
  const { organization, isLoaded: orgClerkLoaded } = useOrganization();

  const organizationFromDB = useQuery(
    api.organizations.getOrganizationByClerkId,
    {
      clerkOrganizationId: organizationId as string,
    }
  );

  if (!organizationId || !orgClerkLoaded || !organizationFromDB) {
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
        companyName={organizationFromDB.name}
      />
    </section>
  );
};

export default page;
