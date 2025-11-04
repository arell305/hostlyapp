import { ConsentStatus } from "@/shared/types/enums";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

export async function upsertContactForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
  name: string,
  phoneNumber: string
): Promise<void> {
  const existing = await ctx.db
    .query("contacts")
    .withIndex("by_userId_phoneNumber", (q) =>
      q.eq("userId", userId).eq("phoneNumber", phoneNumber)
    )
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();

  const now = Date.now();

  if (!existing) {
    await ctx.db.insert("contacts", {
      userId,
      name,
      phoneNumber,
      consentStatus: ConsentStatus.ACTIVE,
      isActive: true,
      updatedAt: now,
    });
    return;
  }
}
