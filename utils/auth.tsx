import { ErrorMessages, UserRole } from "@/types/enums";
import { UserIdentity } from "convex/server";
import { MutationCtx, ActionCtx, QueryCtx } from "../convex/_generated/server";
import { ConvexError } from "convex/values";

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

export async function requireAuthenticatedUser2(
  ctx: MutationCtx | ActionCtx | QueryCtx,
  requiredRoles?: readonly UserRole[]
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.UNAUTHENTICATED,
    });
  }

  const userRole = identity.role as UserRole | undefined;

  if (
    requiredRoles?.length &&
    (!userRole || !requiredRoles.includes(userRole))
  ) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: ErrorMessages.FORBIDDEN_PERMISSION,
    });
  }

  return identity;
}
