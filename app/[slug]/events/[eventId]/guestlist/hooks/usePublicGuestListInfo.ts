import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { GuestListInfoSchema } from "@/types/schemas-types";
import { FrontendErrorMessages, ResponseStatus } from "@/types/enums";
import { PublicGetGuestListInfoByEventIdResponse } from "@/types/convex-types";

interface UsePublicGuestListInfoResult {
  guestListInfo: GuestListInfoSchema | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

export const usePublicGuestListInfo = (
  eventId: Id<"events">
): UsePublicGuestListInfoResult => {
  const response = useQuery(api.guestListInfo.publicGetGuestListInfoByEventId, {
    eventId,
  }) as PublicGetGuestListInfoByEventIdResponse | undefined;

  const isLoading = response === undefined;
  const isError = !!response && response.status !== ResponseStatus.SUCCESS;
  const errorMessage =
    isError && "error" in response
      ? response.error
      : FrontendErrorMessages.GENERIC_ERROR;

  const guestListInfo =
    response && response.status === ResponseStatus.SUCCESS
      ? response.data.guestListInfo
      : null;

  return {
    guestListInfo,
    isLoading,
    isError,
    errorMessage,
  };
};
