import { Id } from "@/convex/_generated/dataModel";

export const EVENT_REQUIRED_VARIABLES = [
  { key: "eventName", label: "Event Name" },
  { key: "eventDate", label: "Event Date" },
  { key: "startTime", label: "Start Time" },
  { key: "address", label: "Address" },
];

export const GUEST_LIST_VARIABLES = [
  { key: "checkInCloseTime", label: "GL Arrive By" },
  { key: "guestListRules", label: "GL Rules" },
];

export const TAGS_BY_CONTEXT = [
  { key: "guestFirstName", label: "Guest First Name" },
  { key: "sender", label: "Sender First Name" },
  ...EVENT_REQUIRED_VARIABLES,
  ...GUEST_LIST_VARIABLES,
  { key: "companyName", label: "Company" },
];

export const hasEventRequiredVariables = (body: string) => {
  return EVENT_REQUIRED_VARIABLES.some((variable) =>
    body.includes(`{{${variable.key}}}`)
  );
};

export const hasGuestListVariables = (body: string) => {
  return GUEST_LIST_VARIABLES.some((variable) =>
    body.includes(`{{${variable.key}}}`)
  );
};

export type VariableFilter = "all" | "noEvent" | "noGuestList";

export const getFilteredVariables = (
  filter: VariableFilter
): InsertableVariable[] => {
  switch (filter) {
    case "all":
      return TAGS_BY_CONTEXT;

    case "noEvent":
      return TAGS_BY_CONTEXT.filter(
        (v) =>
          !EVENT_REQUIRED_VARIABLES.some((ev) => ev.key === v.key) &&
          !GUEST_LIST_VARIABLES.some((gv) => gv.key === v.key)
      );

    case "noGuestList":
      return TAGS_BY_CONTEXT.filter(
        (v) => !GUEST_LIST_VARIABLES.some((gv) => gv.key === v.key)
      );

    default:
      return TAGS_BY_CONTEXT;
  }
};

export interface InsertableVariable {
  key: string;
  label: string;
}

export const getVariableFilter = ({
  hasGuestList,
  eventId,
}: {
  hasGuestList: boolean;
  eventId?: Id<"events"> | null;
}): VariableFilter => {
  if (!eventId) {
    return "noEvent";
  }
  if (!hasGuestList) {
    return "noGuestList";
  }
  return "all";
};
