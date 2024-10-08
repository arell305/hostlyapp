import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

export const addGuestList = mutation({
  args: {
    newNames: v.array(v.string()),
    clerkPromoterId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const newGuestObjects = args.newNames.map((name) => ({
      id: `guest_${nanoid()}`,
      name,
    }));

    const existingGuestList = await ctx.db
      .query("guestLists")
      .filter((q) =>
        q.and(
          q.eq(q.field("clerkPromoterId"), args.clerkPromoterId),
          q.eq(q.field("eventId"), args.eventId)
        )
      )
      .first();

    if (existingGuestList) {
      const updatedNames = [...existingGuestList.names, ...newGuestObjects];
      await ctx.db.patch(existingGuestList._id, {
        names: updatedNames,
      });
      return {
        guestListId: existingGuestList._id,
        names: updatedNames,
      };
    }

    const newGuestListId = await ctx.db.insert("guestLists", {
      names: newGuestObjects,
      clerkPromoterId: args.clerkPromoterId,
      eventId: args.eventId,
    });

    return {
      guestListId: newGuestListId,
      names: newGuestObjects,
    };
  },
});

export const getGuestListByPromoter = query({
  args: {
    clerkPromoterId: v.string(),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const guestList = await ctx.db
      .query("guestLists")
      .filter((q) =>
        q.and(
          q.eq(q.field("clerkPromoterId"), args.clerkPromoterId),
          q.eq(q.field("eventId"), args.eventId)
        )
      )
      .first();

    if (!guestList) {
      return { guestListId: null, names: [] };
    }

    return {
      guestListId: guestList._id,
      names: guestList.names,
    };
  },
});

export const updateGuestName = mutation({
  args: {
    guestListId: v.id("guestLists"),
    guestId: v.string(),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const { guestListId, guestId, newName } = args;

    // Get the guest list directly using the ID
    const guestList = await ctx.db.get(guestListId);

    if (!guestList) {
      throw new Error("Guest list not found");
    }

    // Find the guest in the names array and update their name
    const updatedNames = guestList.names.map((guest) => {
      if (guest.id === guestId) {
        return { ...guest, name: newName };
      }
      return guest;
    });

    // Update the guest list with the new names array
    await ctx.db.patch(guestListId, {
      names: updatedNames,
    });

    return {
      guestListId,
      updatedGuest: updatedNames.find((guest) => guest.id === guestId),
    };
  },
});

export const deleteGuestName = mutation({
  args: {
    guestListId: v.id("guestLists"),
    guestId: v.string(),
  },
  handler: async (ctx, args) => {
    const { guestListId, guestId } = args;

    // Get the guest list directly using the ID
    const guestList = await ctx.db.get(guestListId);

    if (!guestList) {
      throw new Error("Guest list not found");
    }

    // Filter out the guest with the matching ID
    const updatedNames = guestList.names.filter(
      (guest) => guest.id !== guestId
    );

    // If the guest wasn't found, throw an error
    if (updatedNames.length === guestList.names.length) {
      throw new Error("Guest not found in the list");
    }

    // Update the guest list with the new names array
    await ctx.db.patch(guestListId, {
      names: updatedNames,
    });

    return {
      guestListId,
      deletedGuestId: guestId,
      remainingGuestsCount: updatedNames.length,
    };
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
