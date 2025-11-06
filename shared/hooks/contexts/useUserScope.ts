import { UserScope, UserScopeContext } from "@/contexts/UserScope";
import { useContext } from "react";

export function useUserScope(): UserScope {
  const context = useContext(UserScopeContext);
  if (!context) {
    throw new Error("UserScopeProvider missing");
  }

  return context;
}
