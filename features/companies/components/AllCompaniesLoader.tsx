"use client";

import { useGetAllOrganizations } from "@/domain/organizations";
import FullLoading from "@shared/ui/loading/FullLoading";
import CompaniesContent from "./CompaniesContant";

const AllCompaniesLoader = () => {
  const companies = useGetAllOrganizations();

  if (!companies) {
    return <FullLoading />;
  }

  return <CompaniesContent companies={companies} />;
};

export default AllCompaniesLoader;
