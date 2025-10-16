import React from "react";
import { useGetAllOrganizations } from "@/hooks/convex/organizations";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import CompaniesContent from "./CompaniesContant";

const GetAllCompanies: React.FC = () => {
  const companies = useGetAllOrganizations();

  if (!companies) {
    return <FullLoading />;
  }

  return <CompaniesContent companies={companies} />;
};

export default GetAllCompanies;
