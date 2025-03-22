"use client";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import CompanyCard from "../components/cards/CompanyCard";
import FullLoading from "../components/loading/FullLoading";
import ErrorComponent from "../components/errors/ErrorComponent";
import {
  ResponseStatus,
  SubscriptionStatus,
  SubscriptionTier,
} from "@/types/enums";

const PromotionalCompaniesList = () => {
  const router = useRouter();

  const organizationsResponse = useQuery(api.organizations.getAllOrganizations);

  if (!organizationsResponse) {
    return <FullLoading />;
  }

  if (organizationsResponse.status === ResponseStatus.ERROR) {
    return <ErrorComponent message={organizationsResponse.error} />;
  }

  const handleCompanyClick = (slug: string) => {
    router.push(`/${slug}/app/`);
  };

  return (
    <div className="justify-center  max-w-3xl  mx-auto mt-1.5 md:min-h-[300px]">
      <h1 className=" text-3xl md:text-4xl mt-2 font-bold mb-2 w-full px-4">
        Companies
      </h1>
      <div className="flex flex-col flex-wrap  w-full ">
        {organizationsResponse.data.organizationDetails
          .filter((company) => company.slug !== "admin")
          .map((company) => (
            <div
              key={company.organizationId}
              className="cursor-pointer"
              onClick={() => handleCompanyClick(company.slug)}
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

export default PromotionalCompaniesList;
