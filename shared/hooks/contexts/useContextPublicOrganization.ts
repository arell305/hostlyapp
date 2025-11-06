import { PublicOrganizationContext } from "@/contexts/PublicOrganizationContext";
import { ErrorMessages } from "@/shared/types/enums";
import { useContext } from "react";

export function useContextPublicOrganization() {
  const ctx = useContext(PublicOrganizationContext);
  if (!ctx) {
    throw new Error(ErrorMessages.CONTEXT_ORGANIZATION_PROVER);
  }
  return ctx;
}
