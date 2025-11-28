import { ErrorMessages, UserRole } from "@/shared/types/enums";
import { UserIdentity } from "convex/server";
import { MutationCtx, ActionCtx, QueryCtx } from "@/convex/_generated/server";
import { throwConvexError } from "@/convex/backendUtils/errors";

export async function requireAuthenticatedUser(
  ctx: MutationCtx | ActionCtx | QueryCtx,
  requiredRoles?: UserRole[]
): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throwConvexError(ErrorMessages.UNAUTHENTICATED, {
      code: "UNAUTHORIZED",
      showToUser: true,
    });
  }

  const userRole = identity.role as UserRole;

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    throwConvexError(ErrorMessages.FORBIDDEN_PERMISSION, {
      code: "FORBIDDEN",
      showToUser: true,
    });
  }

  return identity;
}
