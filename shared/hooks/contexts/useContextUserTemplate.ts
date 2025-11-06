import { UserTemplateContext } from "@/contexts/UserTemplateContext";
import { ErrorMessages } from "@/shared/types/enums";
import { useContext } from "react";

export const useContextUserTemplate = () => {
  const ctx = useContext(UserTemplateContext);
  if (!ctx) {
    throw new Error(ErrorMessages.CONTEXT_USER_TEMPLATE_PROVIDER);
  }
  return ctx;
};
