import { ErrorMessages } from "@/types/enums";
import { UserIdentity } from "convex/server";
import { MutationCtx, ActionCtx } from "../convex/_generated/server";
import { UserRole } from "./enum";

export async function requireAuthenticatedUser(
  ctx: MutationCtx | ActionCtx,
  requiredRoles?: UserRole[]
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error(ErrorMessages.UNAUTHENTICATED);
  }

  const userRole = identity.role as UserRole;

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    throw new Error(ErrorMessages.FORBIDDEN_PERMISSION);
  }

  return identity;
}
