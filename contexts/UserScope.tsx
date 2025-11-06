"use client";

import { createContext } from "react";
import type { Id } from "convex/_generated/dataModel";

export type UserScope = { userId: Id<"users"> };

export const UserScopeContext = createContext<UserScope | null>(null);

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
