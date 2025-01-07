"use client";
import { usePaginatedQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../convex/_generated/api";

const CompanyEvents = () => {
  const params = useParams();
  const companyName = params.companyName;

  const response = usePaginatedQuery(
    api.events.getEventsByOrganization,
    {
      organizationName: companyName as string,
    },
    {
      initialNumItems: 5,
    }
  );
  console.log("response,", response);
  return <h1>{companyName}</h1>;
};

export default CompanyEvents;
