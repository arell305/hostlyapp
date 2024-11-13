import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// convex/getFileUrl.ts
export const getFileUrl = query(
  async (ctx, { storageId }: { storageId: Id<"_storage"> | null }) => {
    // Generate the URL for the file using its storageId wrapped in     Id<"_storage">
    if (!storageId) {
      return null;
    }
    const fileUrl = await ctx.storage.getUrl(storageId);
    return fileUrl;
  }
);
