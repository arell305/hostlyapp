import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthenticatedUser2 } from "@/utils/auth";
import { validateContact, validateUser } from "./backendUtils/validation";
import {
  isEmptyObject,
  isUserTheSameAsIdentity,
  pickDefined,
} from "./backendUtils/helper";

import { GuestPatch } from "@/types/patch-types";
import { Doc, Id } from "./_generated/dataModel";

export const getContacts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"contacts">[]> => {
    const { userId } = args;

    const identity = await requireAuthenticatedUser2(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_userId_name", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return contacts;
  },
});

export const insertContact = mutation({
  args: {
    name: v.string(),
    userId: v.id("users"),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"contacts">> => {
    const { name, userId, phoneNumber } = args;

    const identity = await requireAuthenticatedUser2(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const contactId = await ctx.db.insert("contacts", {
      name,
      userId,
      phoneNumber,
      isActive: true,
      updatedAt: Date.now(),
    });

    return contactId;
  },
});

export const updateContact = mutation({
  args: {
    contactId: v.id("contacts"),
    updates: v.object({
      name: v.optional(v.string()),
      phoneNumber: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args): Promise<Id<"contacts">> => {
    const { contactId, updates } = args;
    const { name, phoneNumber, isActive } = updates;

    const identity = await requireAuthenticatedUser2(ctx);

    const contact = validateContact(await ctx.db.get(contactId));
    const user = validateUser(await ctx.db.get(contact.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const patch = pickDefined<GuestPatch>({
      name,
      phoneNumber,
      isActive,
    });

    isEmptyObject(patch);

    await ctx.db.patch(contactId, { ...patch, updatedAt: Date.now() });

    return contactId;
  },
});
