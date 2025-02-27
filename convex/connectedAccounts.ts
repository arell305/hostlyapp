import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { ResponseStatus, StripeAccountStatus, UserRole } from "../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { ConnectedAccountsSchema, UserSchema } from "@/types/schemas-types";
import { GetConnectedAccountByClerkUserIdResponse } from "@/types/convex-types";
import { StripeAccountStatusConvex } from "./schema";
import {
  DeleteConnectedAccountResponse,
  SaveConnectedAccountResponse,
} from "@/types/convex/internal-types";
import { Id } from "./_generated/dataModel";
import { OrganizationsSchema } from "@/types/types";
import { checkIsHostlyAdmin } from "../utils/helpers";

export const saveConnectedAccount = internalMutation({
  args: {
    customerId: v.id("customers"),
    stripeAccountId: v.string(),
    status: StripeAccountStatusConvex,
  },
  handler: async (ctx, args): Promise<SaveConnectedAccountResponse> => {
    try {
      const existingAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
        .first();

      let connectedAccountId: Id<"connectedAccounts">;
      if (existingAccount) {
        await ctx.db.patch(existingAccount._id, {
          stripeAccountId: args.stripeAccountId,
          status: args.status,
          lastStripeUpdate: Date.now(),
        });
        connectedAccountId = existingAccount._id;
      } else {
        connectedAccountId = await ctx.db.insert("connectedAccounts", {
          customerId: args.customerId,
          stripeAccountId: args.stripeAccountId,
          status: args.status,
          lastStripeUpdate: Date.now(),
        });
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          connectedAccountId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const getConnectedAccountByCustomerId = internalQuery({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args): Promise<ConnectedAccountsSchema> => {
    try {
      const account: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
        .first();

      if (!account) {
        throw new Error(ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND);
      }

      return account;
    } catch (error) {
      console.error("Error in getConnectedAccountByCustomerId:", error);
      throw new Error("Failed to fetch connected account");
    }
  },
});

export const deleteConnectedAccount = internalMutation({
  args: {
    connectedAccountId: v.id("connectedAccounts"),
  },
  handler: async (ctx, args): Promise<DeleteConnectedAccountResponse> => {
    try {
      const connectedAccount = await ctx.db.get(args.connectedAccountId);

      if (!connectedAccount) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.CONNECTED_ACCOUNT_NOT_FOUND,
        };
      }

      await ctx.db.patch(connectedAccount._id, {
        status: StripeAccountStatus.DISABLED,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          connectedAccountId: connectedAccount._id,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const getConnectedAccountByClerkUserId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetConnectedAccountByClerkUserIdResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      if (identity.role !== UserRole.Admin) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const user: UserSchema | null = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q) =>
          q.eq("clerkUserId", args.clerkUserId)
        )
        .first();

      if (!user) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.USER_NOT_FOUND,
        };
      }

      if (!user.isActive) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.USER_INACTIVE,
        };
      }

      if (!user.customerId) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.CUSTOMER_ID_NOT_FOUND,
        };
      }

      const connectedAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) => q.eq("customerId", user.customerId!))
        .first();

      if (!connectedAccount) {
        return {
          status: ResponseStatus.SUCCESS,
          data: null,
        };
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: { connectedAccount },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const getConnectedAccountByCompanyName = query({
  args: {
    companyName: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetConnectedAccountByClerkUserIdResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .withIndex("by_name", (q) => q.eq("name", args.companyName))
        .first();

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_NOT_FOUND,
        };
      }

      if (!organization.isActive) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_INACTIVE,
        };
      }

      const isHostlyAdmin = checkIsHostlyAdmin(identity.role as string);

      if (
        organization.clerkOrganizationId !== identity.clerk_org_id &&
        !isHostlyAdmin
      ) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const connectedAccount: ConnectedAccountsSchema | null = await ctx.db
        .query("connectedAccounts")
        .withIndex("by_customerId", (q) =>
          q.eq("customerId", organization.customerId)
        )
        .first();

      if (!connectedAccount) {
        return {
          status: ResponseStatus.SUCCESS,
          data: null,
        };
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: { connectedAccount },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});
