import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuthenticatedUser } from "@/utils/auth";
import { validateFaq, validateOrganization } from "./backendUtils/validation";
import {
  isEmptyObject,
  isUserInOrganization,
  pickDefined,
} from "./backendUtils/helper";
import { UserRole } from "@/types/enums";
import { FaqPatch } from "@/types/patch-types";
import { Doc } from "./_generated/dataModel";

export const getCompanyFaqs = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args): Promise<Doc<"faq">[]> => {
    const { organizationId } = args;

    const identity = await requireAuthenticatedUser(ctx);

    const organization = validateOrganization(await ctx.db.get(organizationId));
    isUserInOrganization(identity, organization.clerkOrganizationId);

    const faq = await ctx.db
      .query("faq")
      .filter((q) => q.eq(q.field("organizationId"), organization._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const sortedFaq = faq.sort((a, b) => a.question.localeCompare(b.question));

    return sortedFaq;
  },
});

export const insertCompanyFaq = mutation({
  args: {
    organizationId: v.id("organizations"),
    question: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { organizationId, question, answer } = args;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
      UserRole.Admin,
      UserRole.Manager,
    ]);

    const organization = validateOrganization(await ctx.db.get(organizationId));
    isUserInOrganization(identity, organization.clerkOrganizationId);

    await ctx.db.insert("faq", {
      organizationId,
      question,
      answer,
      isActive: true,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const updateCompanyFaq = mutation({
  args: {
    faqId: v.id("faq"),
    updates: v.object({
      question: v.optional(v.string()),
      answer: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { faqId, updates } = args;
    const { question, answer, isActive } = updates;

    const identity = await requireAuthenticatedUser(ctx, [
      UserRole.Hostly_Admin,
      UserRole.Hostly_Moderator,
      UserRole.Admin,
      UserRole.Manager,
    ]);

    const faq = validateFaq(await ctx.db.get(faqId));

    const organization = validateOrganization(
      await ctx.db.get(faq.organizationId)
    );
    isUserInOrganization(identity, organization.clerkOrganizationId);

    const patch = pickDefined<FaqPatch>({ question, answer, isActive });

    isEmptyObject(patch);

    await ctx.db.patch(faqId, { ...patch, updatedAt: Date.now() });

    return true;
  },
});
