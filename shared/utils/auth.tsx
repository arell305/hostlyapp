import { ErrorMessages, UserRole } from "@/shared/types/enums";
import { UserIdentity } from "convex/server";
import { MutationCtx, ActionCtx, QueryCtx } from "@/convex/_generated/server";
import { ConvexError } from "convex/values";

export async function requireAuthenticatedUser(
  ctx: MutationCtx | ActionCtx | QueryCtx,
  requiredRoles?: UserRole[]
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.UNAUTHENTICATED,
    });
  }

  const userRole = identity.role as UserRole;

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: ErrorMessages.FORBIDDEN_PERMISSION,
    });
  }

  return identity;
}
