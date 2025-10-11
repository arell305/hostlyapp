"use client";
import React from "react";
import { useContextPublicOrganization } from "@/contexts/PublicOrganizationContext";
import { useContextOrganization } from "@/contexts/OrganizationContext";

const page = () => {
  const test = useContextOrganization();
  console.log(test);
  return <div>page</div>;
};

export default page;
