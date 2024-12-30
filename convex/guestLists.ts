import { ErrorMessages } from "@/types/enums";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";
import { ResponseStatus, UserRole } from "../utils/enum";
import {
  AddGuestListResponse,
  DeleteGuestNameResponse,
  EventSchema,
  GetGuestListByPromoterResponse,
  GuestListNameSchema,
  GuestListSchema,
  NewGuest,
  UpdateGuestNameResponse,
} from "@/types/types";
import { Id } from "./_generated/dataModel";

export const addGuestList = mutation({
  args: {
    newNames: v.array(v.string()),
    clerkPromoterId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<AddGuestListResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      if (identity.role !== UserRole.Promoter) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }
      const event: EventSchema | null = await ctx.db.get(args.eventId);
      if (!event) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const newGuestObjects: NewGuest[] = args.newNames.map((name) => ({
        id: `guest_${nanoid()}`,
        name,
      }));

      const existingGuestList: GuestListSchema | null = await ctx.db
        .query("guestLists")
        .filter((q) =>
          q.and(
            q.eq(q.field("clerkPromoterId"), args.clerkPromoterId),
            q.eq(q.field("eventId"), args.eventId)
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
          status: ResponseStatus.ERROR,
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
          clerkPromoterId: args.clerkPromoterId,
          eventId: args.eventId,
        }
      );

      return {
        status: ResponseStatus.ERROR,
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
    clerkPromoterId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GetGuestListByPromoterResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      // validate user

      const guestList: GuestListSchema | null = await ctx.db
        .query("guestLists")
        .filter((q) =>
          q.and(
            q.eq(q.field("clerkPromoterId"), args.clerkPromoterId),
            q.eq(q.field("eventId"), args.eventId)
          )
        )
        .first();

      if (!guestList) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      // validate user belongs to org

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListId: guestList._id,
          names: guestList.names,
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
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      if (identity.role !== UserRole.Promoter) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }
      const guestList: GuestListSchema | null = await ctx.db.get(guestListId);

      if (!guestList) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

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
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      if (identity.role !== UserRole.Promoter) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.FORBIDDEN,
        };
      }

      const guestList: GuestListSchema | null = await ctx.db.get(guestListId);

      if (!guestList) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const updatedNames: GuestListNameSchema[] = guestList.names.filter(
        (guest) => guest.id !== guestId
      );
      if (updatedNames.length === guestList.names.length) {
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

// export const updateGuestListNamesByPromoter = mutation({
//   args: {
//     guestListId: v.id("guestLists"),
//     names: v.array(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const { guestListId, names } = args;

//     // Check if the guest list exists
//     const existingGuestList = await ctx.db.get(guestListId);
//     if (!existingGuestList) {
//       throw new Error("Guest list not found");
//     }

//     // Update only the names field
//     await ctx.db.patch(guestListId, { names });

//     return { success: true, message: "Guest list names updated successfully" };
//   },
// });
