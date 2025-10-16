"use client";

import { useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { api } from "convex/_generated/api";
import { UserWithPromoCode } from "@/types/types";

export function useFindUserById(
  userId: Id<"users">
): UserWithPromoCode | undefined {
  return useQuery(api.users.findUserById, { userId });
}
