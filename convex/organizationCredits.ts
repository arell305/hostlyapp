import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getAvailableGuestListCreditsInternal = internalQuery({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args): Promise<number> => {
    const { organizationId } = args;

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
  },
});
