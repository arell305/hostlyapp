import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import {
  InsertGuestListResponse,
  UpdateGuestListCloseTimeResponse,
} from "@/types/types";
import { ErrorMessages } from "@/types/enums";
import { ResponseStatus } from "../utils/enum";
import { Id } from "./_generated/dataModel";
import { EventSchema, GuestListInfoSchema } from "@/types/schemas-types";

export const insertGuestListInfo = mutation({
  args: {
    eventId: v.id("events"),
    guestListCloseTime: v.number(),
    checkInCloseTime: v.number(),
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
    guestListCloseTime: v.number(),
    checkInCloseTime: v.optional(v.number()),
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

export const createGuestListInfo = internalMutation({
  args: {
    eventId: v.id("events"),
    guestListCloseTime: v.number(),
    checkInCloseTime: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"guestListInfo">> => {
    try {
      const { eventId, guestListCloseTime, checkInCloseTime } = args;

      const guestListInfoId: Id<"guestListInfo"> = await ctx.db.insert(
        "guestListInfo",
        {
          eventId,
          guestListCloseTime,
          checkInCloseTime,
        }
      );

      await ctx.db.patch(eventId, { guestListInfoId });

      return guestListInfoId;
    } catch (error) {
      console.error("Error creating guest list info:", error);
      throw new Error("Failed to create guest list info");
    }
  },
});

export const getGuestListInfoByEventId = internalQuery({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args): Promise<GuestListInfoSchema | null> => {
    try {
      return await ctx.db
        .query("guestListInfo")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
        .first();
    } catch (error) {
      console.error("Error fetching guest list info by event ID:", error);
      throw new Error("Failed to fetch guest list info");
    }
  },
});

export const updateGuestListInfo = internalMutation({
  args: {
    guestListInfoId: v.id("guestListInfo"),
    guestListCloseTime: v.number(),
    checkInCloseTime: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"guestListInfo">> => {
    try {
      const { guestListInfoId, guestListCloseTime, checkInCloseTime } = args;

      await ctx.db.patch(guestListInfoId, {
        guestListCloseTime,
        checkInCloseTime,
      });

      return guestListInfoId;
    } catch (error) {
      console.error("Error updating guest list info:", error);
      throw new Error("Failed to update guest list info");
    }
  },
});
