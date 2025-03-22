import { ShowErrorMessages, UserRole, ResponseStatus } from "@/types/enums";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";
import {
  DeleteGuestNameResponse,
  GuestListNameSchema,
  GuestListSchema,
} from "@/types/types";
import { Id } from "./_generated/dataModel";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateEvent,
  validateGuestList,
  validateUser,
} from "./backendUtils/validation";
import {
  handleError,
  isUserInCompanyOfEvent,
  isUserThePromoter,
} from "./backendUtils/helper";
import {
  GetGuestListByPromoterResponse,
  UpdateGuestNameResponse,
  AddGuestListResponse,
  NewGuest,
} from "@/types/convex-types";

export const addGuestList = mutation({
  args: {
    newNames: v.array(v.string()),
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<AddGuestListResponse> => {
    const { newNames, eventId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.user as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const event = validateEvent(await ctx.db.get(args.eventId));

      isUserInCompanyOfEvent(user, event);

      const newGuestObjects: NewGuest[] = newNames.map((name) => ({
        id: `guest_${nanoid()}`,
        name,
      }));

      const existingGuestList: GuestListSchema | null = await ctx.db
        .query("guestLists")
        .filter((q) =>
          q.and(
            q.eq(q.field("userPromoterId"), user._id),
            q.eq(q.field("eventId"), eventId)
          )
        )
        .first();

      if (existingGuestList) {
        const updatedNames: NewGuest[] = [
          ...existingGuestList.names,
          ...newGuestObjects,
        ];
        await ctx.db.patch(existingGuestList._id, {
          names: updatedNames,
        });
        return {
          status: ResponseStatus.SUCCESS,
          data: {
            guestListId: existingGuestList._id,
            names: updatedNames,
          },
        };
      }

      const newGuestListId: Id<"guestLists"> = await ctx.db.insert(
        "guestLists",
        {
          names: newGuestObjects,
          userPromoterId: user._id,
          eventId,
        }
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId: newGuestListId,
          names: newGuestObjects,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const getGuestListByPromoter = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetGuestListByPromoterResponse> => {
    const { eventId } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.user as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const guestList = validateGuestList(
        await ctx.db
          .query("guestLists")
          .filter((q) =>
            q.and(
              q.eq(q.field("userPromoterId"), user._id),
              q.eq(q.field("eventId"), eventId)
            )
          )
          .first()
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId: guestList._id,
          names: guestList.names,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const updateGuestName = mutation({
  args: {
    guestListId: v.id("guestLists"),
    guestId: v.string(),
    newName: v.string(),
  },
  handler: async (ctx, args): Promise<UpdateGuestNameResponse> => {
    const { guestListId, guestId, newName } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      const clerkUserId = identity.user as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const guestList = validateGuestList(await ctx.db.get(guestListId));

      isUserThePromoter(guestList, user);

      const updatedNames: GuestListNameSchema[] = guestList.names.map(
        (guest) => {
          if (guest.id === guestId) {
            return { ...guest, name: newName };
          }
          return guest;
        }
      );

      await ctx.db.patch(guestListId, {
        names: updatedNames,
      });

      const updatedGuest: GuestListNameSchema | undefined = updatedNames.find(
        (guest) => guest.id === guestId
      );

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId,
          updatedGuest: updatedGuest,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});

export const deleteGuestName = mutation({
  args: {
    guestListId: v.id("guestLists"),
    guestId: v.string(),
  },
  handler: async (ctx, args): Promise<DeleteGuestNameResponse> => {
    const { guestListId, guestId } = args;

    try {
      const identity = await requireAuthenticatedUser(ctx, [
        UserRole.Promoter,
        UserRole.Hostly_Moderator,
        UserRole.Hostly_Admin,
      ]);

      if (identity.role !== UserRole.Promoter) {
        throw new Error(ShowErrorMessages.FORBIDDEN_PRIVILEGES);
      }

      const clerkUserId = identity.user as string;

      const user = validateUser(
        await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
          .unique()
      );

      const guestList = validateGuestList(await ctx.db.get(guestListId));

      isUserThePromoter(guestList, user);

      const updatedNames: GuestListNameSchema[] = guestList.names.filter(
        (guest) => guest.id !== guestId
      );
      if (updatedNames.length === guestList.names.length) {
        throw new Error(ShowErrorMessages.GUEST_NOT_FOUND);
      }
      await ctx.db.patch(guestListId, {
        names: updatedNames,
      });

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId,
          deletedGuestId: guestId,
          remainingGuestsCount: updatedNames.length,
        },
      };
    } catch (error) {
      return handleError(error);
    }
  },
});
