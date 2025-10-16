import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

// need to use
export function useFileUrl(
  storageId: Id<"_storage"> | null
): string | null | undefined {
  return useQuery(api.photo.getFileUrl, storageId ? { storageId } : "skip");
}
