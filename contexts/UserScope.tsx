"use client";

import { createContext, useContext } from "react";
import type { Id } from "convex/_generated/dataModel";

type UserScope = { userId: Id<"users"> };

const UserScopeContext = createContext<UserScope | null>(null);

export function UserScopeProvider({
  userId,
  children,
}: {
  userId: Id<"users">;
  children: React.ReactNode;
}) {
  return (
    <UserScopeContext.Provider value={{ userId }}>
      {children}
    </UserScopeContext.Provider>
  );
}

export function useUserScope(): UserScope {
  const context = useContext(UserScopeContext);
  if (!context) {
    throw new Error("UserScopeProvider missing");
  }

  return context;
}
