import { v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  EventSchema,
  InsertGuestListResponse,
  UpdateGuestListCloseTimeResponse,
} from "@/types/types";
import { ErrorMessages } from "@/types/enums";
import { ResponseStatus } from "../utils/enum";
import { Id } from "./_generated/dataModel";

export const insertGuestListInfo = mutation({
  args: {
    eventId: v.id("events"),
    guestListCloseTime: v.string(),
    checkInCloseTime: v.string(),
  },
  handler: async (ctx, args): Promise<InsertGuestListResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
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

      const guestListInfoId: Id<"guestListInfo"> = await ctx.db.insert(
        "guestListInfo",
        {
          eventId: args.eventId,
          guestListCloseTime: args.guestListCloseTime,
          checkInCloseTime: args.checkInCloseTime,
          guestListIds: [],
          isActive: true,
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

export const updateGuestListCloseTime = mutation({
  args: {
    guestListInfoId: v.id("guestListInfo"),
    guestListCloseTime: v.string(),
    checkInCloseTime: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<UpdateGuestListCloseTimeResponse> => {
    const { guestListInfoId, guestListCloseTime, checkInCloseTime } = args;

    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      await ctx.db.patch(guestListInfoId, {
        guestListCloseTime,
        checkInCloseTime,
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
