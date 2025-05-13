import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { ErrorMessages, ResponseStatus, UserRole } from "@/types/enums";
import { GetAvailableGuestListCreditsResponse } from "@/types/convex-types";
import { handleError, isUserInOrganization } from "./backendUtils/helper";
import { requireAuthenticatedUser } from "@/utils/auth";
import { validateOrganization } from "./backendUtils/validation";

export const getAvailableGuestListCredits = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<GetAvailableGuestListCreditsResponse> => {
    const { organizationId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Admin,
        UserRole.Manager,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const organization = await ctx.db.get(organizationId);
      const validatedOrganization = validateOrganization(organization);
      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      const creditsRecord = await ctx.db
        .query("organizationCredits")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", organizationId)
        )
        .unique();

      if (!creditsRecord) {
        return {
          status: ResponseStatus.SUCCESS,
          data: {
            availableCredits: 0,
          },
        };
      }

      const available = creditsRecord.totalCredits - creditsRecord.creditsUsed;

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          availableCredits: available,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getAvailableGuestListCreditsInternal = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<Number> => {
    const { organizationId } = args;
    try {
      const creditsRecord = await ctx.db
        .query("organizationCredits")
        .withIndex("by_organizationId", (q) =>
          q.eq("organizationId", organizationId)
        )
        .unique();

      if (!creditsRecord) {
        return 0;
      }

      const availableCredits =
        creditsRecord.totalCredits - creditsRecord.creditsUsed;

      return availableCredits;
    } catch (error) {
      console.error(error);
      throw new Error(ErrorMessages.ORGANIZATION_CREDITS_DB_QUERY);
    }
  },
});
