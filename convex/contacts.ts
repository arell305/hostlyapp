import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthenticatedUser } from "@/shared/utils/auth";
import { validateContact, validateUser } from "./backendUtils/validation";
import {
  isEmptyObject,
  isUserTheSameAsIdentity,
  pickDefined,
} from "./backendUtils/helper";

import { GuestPatch } from "@/shared/types/patch-types";
import { Doc } from "./_generated/dataModel";
import { ConsentStatus } from "@/shared/types/enums";
import { isValidPhoneNumber } from "@/shared/utils/frontend-validation";

export const getContacts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<Doc<"contacts">[]> => {
    const { userId } = args;

    const identity = await requireAuthenticatedUser(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return contacts
      .filter((c) => c.isActive)
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
  },
});

export const insertContact = mutation({
  args: {
    name: v.string(),
    userId: v.id("users"),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { name, userId, phoneNumber } = args;

    const identity = await requireAuthenticatedUser(ctx);

    const user = validateUser(await ctx.db.get(userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    if (!isValidPhoneNumber(phoneNumber)) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Invalid phone number",
      });
    }

    const existingContact = await ctx.db
      .query("contacts")
      .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", phoneNumber))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    if (existingContact) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Contact already exists",
      });
    }

    await ctx.db.insert("contacts", {
      name,
      userId,
      phoneNumber,
      isActive: true,
      updatedAt: Date.now(),
      consentStatus: ConsentStatus.ACTIVE,
    });

    return true;
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
  handler: async (ctx, args): Promise<boolean> => {
    const { contactId, updates } = args;
    const { name, phoneNumber, isActive } = updates;

    const identity = await requireAuthenticatedUser(ctx);

    const contact = validateContact(await ctx.db.get(contactId));
    const user = validateUser(await ctx.db.get(contact.userId));
    isUserTheSameAsIdentity(identity, user.clerkUserId);

    if (phoneNumber && phoneNumber !== contact.phoneNumber) {
      if (!isValidPhoneNumber(phoneNumber)) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Invalid phone number",
        });
      }

      const existingContact = await ctx.db
        .query("contacts")
        .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", phoneNumber))
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      if (existingContact) {
        throw new ConvexError({
          code: "BAD_REQUEST",
          message: "Contact already exists",
        });
      }
    }

    const patch = pickDefined<GuestPatch>({
      name,
      phoneNumber,
      isActive,
    });

    isEmptyObject(patch);

    await ctx.db.patch(contactId, { ...patch, updatedAt: Date.now() });

    return true;
  },
});

export const bulkUpsertContacts = mutation({
  args: {
    userId: v.id("users"),
    rows: v.array(
      v.object({
        name: v.string(),
        phoneNumber: v.string(),
      })
    ),
  },
  handler: async (context, args): Promise<boolean> => {
    const { userId, rows } = args;
    const currentTimestamp = Date.now();

    for (const inputRow of rows) {
      const trimmedName = inputRow.name.trim();
      const trimmedPhone = inputRow.phoneNumber.trim();
      if (!trimmedPhone) {
        continue;
      }

      const existingContact = await context.db
        .query("contacts")
        .withIndex("by_userId_phoneNumber", (indexQuery) =>
          indexQuery.eq("userId", userId).eq("phoneNumber", trimmedPhone)
        )
        .first();

      if (!existingContact) {
        await context.db.insert("contacts", {
          userId,
          name: trimmedName,
          phoneNumber: trimmedPhone,
          consentStatus: ConsentStatus.ACTIVE,
          isActive: true,
          updatedAt: currentTimestamp,
        });
        continue;
      }

      if (!existingContact.name && trimmedName) {
        await context.db.patch(existingContact._id, {
          name: trimmedName,
          updatedAt: currentTimestamp,
          isActive: true,
        });
      } else {
        await context.db.patch(existingContact._id, {
          updatedAt: currentTimestamp,
          isActive: true,
        });
      }
    }

    return true;
  },
});
