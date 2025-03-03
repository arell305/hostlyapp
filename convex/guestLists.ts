import { ErrorMessages } from "@/types/enums";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";
import { ResponseStatus, UserRole } from "../utils/enum";
import {
  DeleteGuestNameResponse,
  GuestListNameSchema,
  GuestListSchema,
  UserSchema,
} from "@/types/types";
import { Id } from "./_generated/dataModel";
import { requireAuthenticatedUser } from "../utils/auth";
import {
  validateEvent,
  validateGuestList,
  validateUser,
} from "./backendUtils/validation";
import {
  isUserInCompanyOfEvent,
  isUserThePromoter,
} from "./backendUtils/helper";
import { EventSchema } from "@/types/schemas-types";
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

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique();

      const validatedUser = validateUser(user);

      const event: EventSchema | null = await ctx.db.get(args.eventId);
      const validatedEvent = validateEvent(event);

      isUserInCompanyOfEvent(validatedUser, validatedEvent);

      const newGuestObjects: NewGuest[] = newNames.map((name) => ({
        id: `guest_${nanoid()}`,
        name,
      }));

      const existingGuestList: GuestListSchema | null = await ctx.db
        .query("guestLists")
        .filter((q) =>
          q.and(
            q.eq(q.field("userPromoterId"), validatedUser._id),
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
          userPromoterId: validatedUser._id,
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

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique();

      const validatedUser = validateUser(user);

      const guestList: GuestListSchema | null = await ctx.db
        .query("guestLists")
        .filter((q) =>
          q.and(
            q.eq(q.field("userPromoterId"), validatedUser._id),
            q.eq(q.field("eventId"), eventId)
          )
        )
        .first();

      const validatedGuestList = validateGuestList(guestList);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId: validatedGuestList._id,
          names: validatedGuestList.names,
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

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique();

      const validatedUser = validateUser(user);

      const guestList: GuestListSchema | null = await ctx.db.get(guestListId);

      const validatedGuestList = validateGuestList(guestList);

      isUserThePromoter(validatedGuestList, validatedUser);

      const updatedNames: GuestListNameSchema[] = validatedGuestList.names.map(
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
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const clerkUserId = identity.user as string;

      const user: UserSchema | null = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkUserId"), clerkUserId))
        .unique();

      const validatedUser = validateUser(user);

      const guestList: GuestListSchema | null = await ctx.db.get(guestListId);

      const validatedGuestList = validateGuestList(guestList);

      isUserThePromoter(validatedGuestList, validatedUser);

      const updatedNames: GuestListNameSchema[] =
        validatedGuestList.names.filter((guest) => guest.id !== guestId);
      if (updatedNames.length === validatedGuestList.names.length) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: "Guest not found in the list",
        };
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
