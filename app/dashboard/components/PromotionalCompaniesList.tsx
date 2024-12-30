import { useAction, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CompanyCard from "./cards/CompanyCard";
import { ClerkOrganization } from "@/types/types";
import { SubscriptionStatus, SubscriptionTier } from "../../../utils/enum";

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

  const handleCompanyClick = (organizationId: string, companyName: string) => {
    const encodedName = encodeURIComponent(companyName); // Encode the name to handle spaces and special characters
    router.push(`/${organizationId}?name=${encodedName}`);
  };

  return (
    <div className="flex flex-col items-center justify-center md:border-2 max-w-3xl md:p-6 rounded-lg mx-auto">
      <h1 className=" text-3xl md:text-4xl mt-2 font-bold mb-2 w-full text-center pr-[360px]">
        Companies
      </h1>
      <div className="flex flex-col flex-wrap max-w-xl w-full ">
        {companies
          .filter((company) => company.name !== "Admin") // Filter out companies named "Admin"
          .map((company) => (
            <div
              key={company.clerkOrganizationId}
              className="mb-4 cursor-pointer"
              onClick={() =>
                handleCompanyClick(company.clerkOrganizationId, company.name)
              }
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
