import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getFileUrl = query({
  args: { storageId: v.union(v.id("_storage"), v.null()) },
  handler: async (ctx, { storageId }): Promise<string | null> => {
    try {
      if (!storageId) return null;
      return await ctx.storage.getUrl(storageId);
    } catch (error) {
      console.error(
        `Error fetching file URL for storageId ${storageId}:`,
        error
      );
      return null;
    }
  },
});
