import { v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  EventSchema,
  InsertGuestListResponse,
  UpdateGuestListCloseTimeResponse,
} from "@/types";
import { ErrorMessages } from "@/utils/enums";
import { ResponseStatus } from "../utils/enum";
import { Id } from "./_generated/dataModel";

export const insertGuestListInfo = mutation({
  args: {
    eventId: v.id("events"),
    guestListCloseTime: v.string(),
  },
  handler: async (ctx, args): Promise<InsertGuestListResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const event: EventSchema | null = await ctx.db.get(args.eventId);
      if (!event) {
        return {
          status: ResponseStatus.NOT_FOUND,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }

      const guestListInfoId: Id<"guestListInfo"> = await ctx.db.insert(
        "guestListInfo",
        {
          eventId: args.eventId,
          guestListCloseTime: args.guestListCloseTime,
          guestListIds: [],
        }
      );

      await ctx.db.patch(args.eventId, { guestListInfoId });

      return {
        status: ResponseStatus.SUCCESS,
        data: guestListInfoId,
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

// export const deleteGuestListInfoAndUpdateEvent = mutation({
//   args: { eventId: v.id("events") },
//   handler: async (ctx, args) => {
//     const { eventId } = args;

//     const guestListInfo = await ctx.db
//       .query("guestListInfo")
//       .withIndex("by_eventId", (q) => q.eq("eventId", eventId))
//       .unique();

//     if (guestListInfo) {
//       await ctx.db.delete(guestListInfo._id);
//     }

//     await ctx.db.patch(eventId, { guestListInfoId: undefined });

//     return {
//       success: true,
//       message: "GuestListInfo deleted and event updated successfully",
//     };
//   },
// });

export const updateGuestListCloseTime = mutation({
  args: {
    guestListInfoId: v.id("guestListInfo"),
    guestListCloseTime: v.string(),
  },
  handler: async (ctx, args): Promise<UpdateGuestListCloseTimeResponse> => {
    const { guestListInfoId, guestListCloseTime } = args;

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.UNAUTHENTICATED,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      await ctx.db.patch(guestListInfoId, {
        guestListCloseTime: guestListCloseTime,
      });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          guestListInfoId,
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
