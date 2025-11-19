import { useContext } from "react";
import { OrganizationContext } from "@/contexts/OrganizationContext";

export const useContextOrganization = () => {
  const ctx = useContext(OrganizationContext);
  if (!ctx) {
    throw new Error(
      "useContextOrganization must be used within OrganizationProvider"
    );
  }
  return ctx;
};
