import { v } from "convex/values";
import { query } from "./_generated/server";
import { ResponseStatus } from "../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { OrganizationsSchema, SubscriptionBillingCycle } from "@/types/types";
import { convertToPST } from "../utils/luxon";
import { CustomerSchema, EventSchema } from "@/types/schemas-types";

export const getSubDatesAndGuestEventsCountByDate = query({
  args: {
    customerId: v.id("customers"),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const customer: CustomerSchema | null = await ctx.db.get(args.customerId);

      if (!customer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.CUSTOMER_NOT_FOUND,
        };
      }

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .filter((q) => q.eq(q.field("customerId"), args.customerId))
        .first();

      if (!organization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_NOT_FOUND,
        };
      }

      const inputDatePST = convertToPST(new Date(args.date));

      let billingCycleStartDate: Date;
      let billingCycleEndDate: Date;

      // 2. Calculate billing cycle in PST
      billingCycleStartDate = convertToPST(
        new Date(inputDatePST.getFullYear(), inputDatePST.getMonth(), 1)
      );
      billingCycleEndDate = convertToPST(
        new Date(inputDatePST.getFullYear(), inputDatePST.getMonth() + 1, 0)
      );

      const billingCycleStartTimestamp = billingCycleStartDate.getTime();
      const billingCycleEndTimestamp = billingCycleEndDate.getTime();

      const allEvents: EventSchema[] = await ctx.db
        .query("events")
        .filter((q) =>
          q.eq(q.field("clerkOrganizationId"), organization.clerkOrganizationId)
        )
        .filter((q) => q.gte(q.field("startTime"), billingCycleStartTimestamp))
        .filter((q) => q.lte(q.field("startTime"), billingCycleEndTimestamp))
        .collect();

      const filteredEvents: EventSchema[] = allEvents.filter(
        (event) =>
          event.guestListInfoId !== null && event.guestListInfoId !== undefined
      );

      const billingCycle: SubscriptionBillingCycle = {
        startDate: billingCycleStartTimestamp,
        endDate: billingCycleEndTimestamp,
        eventCount: filteredEvents.length, // Use the count of events with guest lists
      };

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          billingCycle,
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
