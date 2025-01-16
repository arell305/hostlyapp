"use client";
import { useAction } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";

import { ClerkOrganization } from "@/types/types";
import { SubscriptionStatus, SubscriptionTier } from "../../../../utils/enum";
import CompanyCard from "../components/cards/CompanyCard";

const PromotionalCompaniesList = () => {
  const router = useRouter();
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);

  const getOrganizationList = useAction(api.clerk.getOrganizationList);

  const [companies, setCompanies] = useState<ClerkOrganization[]>([]); // Initialize state for companies

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const fetchedOrganizations = await getOrganizationList(); // Call the action to get memberships
        setCompanies(fetchedOrganizations);
      } catch (err) {
        console.log("Failed to fetch companies:", err);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [getOrganizationList]);

  if (!companies) {
    return <div>Loading...</div>;
  }

  const handleCompanyClick = (companyName: string) => {
    const encodedName = encodeURIComponent(companyName); // Encode the name to handle spaces and special characters
    router.push(`/${encodedName}/app/dashboard`);
  };

  return (
    <div className="justify-center  max-w-3xl  mx-auto mt-1.5 md:min-h-[300px]">
      <h1 className=" text-3xl md:text-4xl mt-2 font-bold mb-2 w-full px-4">
        Companies
      </h1>
      <div className="flex flex-col flex-wrap  w-full ">
        {companies
          .filter((company) => company.name !== "admin") // Filter out companies named "Admin"
          .map((company) => (
            <div
              key={company.clerkOrganizationId}
              className="cursor-pointer"
              onClick={() => handleCompanyClick(company.name)}
            >
              <CompanyCard
                imageUrl={company.imageUrl || "https://via.placeholder.com/50"} // Pass image URL
                companyName={company.name} // Pass company name
                status={company.publicMetadata.status as SubscriptionStatus} // Pass status, cast to SubscriptionStatus
                tier={company.publicMetadata.tier as SubscriptionTier} // Pass tier, cast to SubscriptionTier
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default PromotionalCompaniesList;
