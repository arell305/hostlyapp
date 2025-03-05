import { v } from "convex/values";
import { query } from "./_generated/server";
import { ResponseStatus } from "../utils/enum";
import { ErrorMessages } from "@/types/enums";
import { OrganizationsSchema, SubscriptionBillingCycle } from "@/types/types";
import { convertToPST } from "../utils/luxon";
import { EventSchema } from "@/types/schemas-types";
import { requireAuthenticatedUser } from "../utils/auth";
import { validateOrganization } from "./backendUtils/validation";
import { isUserInOrganization } from "./backendUtils/helper";
import { GetSubDatesAndGuestEventsCountByDateResponse } from "@/types/convex-types";

export const getSubDatesAndGuestEventsCountByDate = query({
  args: {
    customerId: v.id("customers"),
    date: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<GetSubDatesAndGuestEventsCountByDateResponse> => {
    const { customerId, date } = args;
    try {
      const identity = await requireAuthenticatedUser(ctx);

      const organization: OrganizationsSchema | null = await ctx.db
        .query("organizations")
        .filter((q) => q.eq(q.field("customerId"), customerId))
        .first();

      const validatedOrganization = validateOrganization(organization);
      isUserInOrganization(identity, validatedOrganization.clerkOrganizationId);

      const inputDatePST = convertToPST(new Date(date));

      let billingCycleStartDate: Date;
      let billingCycleEndDate: Date;

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
          q.eq(q.field("organizationId"), validatedOrganization._id)
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
        eventCount: filteredEvents.length,
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
