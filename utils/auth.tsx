import { ErrorMessages, UserRole } from "@/types/enums";
import { UserIdentity } from "convex/server";
import { MutationCtx, ActionCtx, QueryCtx } from "../convex/_generated/server";

export async function requireAuthenticatedUser(
  ctx: MutationCtx | ActionCtx | QueryCtx,
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
