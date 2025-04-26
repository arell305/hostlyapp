import React from "react";
import CompanyCard from "../components/cards/CompanyCard";
import { OrganizationDetails } from "@/types/types";
import { SubscriptionStatus, SubscriptionTier } from "@/types/enums";

interface CompaniesContentProps {
  organizations: OrganizationDetails[];
  onCompanyClick?: (slug: string) => void;
}

const CompaniesContent: React.FC<CompaniesContentProps> = ({
  organizations,
  onCompanyClick,
}) => {
  return (
    <div className="justify-center max-w-3xl mx-auto mt-1.5 md:min-h-[300px]">
      <h1 className="text-3xl md:text-4xl mt-2 font-bold mb-2 w-full px-4">
        Companies
      </h1>
      <div className="flex flex-col flex-wrap w-full">
        {organizations
          .filter((company) => company.slug !== "admin")
          .map((company) => (
            <div
              key={company.organizationId}
              className="cursor-pointer"
              onClick={() => onCompanyClick?.(company.slug)}
            >
              <CompanyCard
                photoStorageId={company.photoStorageId}
                companyName={company.name}
                status={company.subscriptionStatus as SubscriptionStatus}
                tier={company.subscriptionTier as SubscriptionTier}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default CompaniesContent;
