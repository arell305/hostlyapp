"use client";
import { createContext, useContext } from "react";
import { ErrorMessages } from "@shared/types/enums";
import { useParams } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import NotFoundMessage from "@shared/ui/shared-page/NotFoundMessage";
import UnauthorizedMessage from "@shared/ui/shared-page/UnauthorizedMessage";
import { normalizeUserId } from "@shared/lib/normalizeParams";
import { isHostlyUser } from "@shared/utils/permissions";
import { useContextOrganization } from "./OrganizationContext";

type UserTemplateContextType = {
  userId: Id<"users">;
};

const UserTemplateContext = createContext<UserTemplateContextType | undefined>(
  undefined
);

export const UserTemplateProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { userId: rawUserId } = useParams();
  const userId = normalizeUserId(rawUserId);
  const { user, orgRole } = useContextOrganization();

  const isAppModerator = isHostlyUser(orgRole);

  const isUnauthorized = !isAppModerator && user._id !== userId;

  if (!userId) {
    return <NotFoundMessage />;
  }

  if (isUnauthorized) {
    return <UnauthorizedMessage />;
  }
  return (
    <UserTemplateContext.Provider value={{ userId }}>
      {children}
    </UserTemplateContext.Provider>
  );
};

export const useContextUserTemplate = () => {
  const ctx = useContext(UserTemplateContext);
  if (!ctx) throw new Error(ErrorMessages.CONTEXT_USER_TEMPLATE_PROVIDER);
  return ctx;
};
