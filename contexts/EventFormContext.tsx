"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { TicketType, TicketTypeForm, AddressValue } from "@shared/types/types";
import { ticketNameOptions } from "@shared/types/constants";
import { Doc, Id } from "convex/_generated/dataModel";
import { EventFormErrors } from "@/shared/utils/form-validation/validateEventForm";
import { isIOS } from "@/shared/utils/helpers";

interface EventFormContextType {
  // Event Details
  eventName: string;
  setEventName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  startTime: number | null;
  setStartTime: (val: number | null) => void;
  endTime: number | null;
  setEndTime: (val: number | null) => void;
  photoStorageId: Id<"_storage"> | null;
  setPhotoStorageId: (val: Id<"_storage"> | null) => void;

  // Guest List
  isGuestListSelected: boolean;
  setIsGuestListSelected: (val: boolean) => void;
  guestListCloseTime: number | null;
  setGuestListCloseTime: (val: number | null) => void;
  checkInCloseTime: number | null;
  setCheckInCloseTime: (val: number | null) => void;
  guestListRules: string;
  setGuestListRules: (val: string) => void;

  // Tickets
  isTicketsSelected: boolean;
  setIsTicketsSelected: (val: boolean) => void;
  ticketTypes: TicketTypeForm[];
  setTicketTypes: (val: TicketTypeForm[]) => void;

  // Autocomplete
  value: AddressValue | null;
  setValue: (val: AddressValue | null) => void;

  // errors
  errors: EventFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<EventFormErrors>>;
  isIOSDevice: boolean;
}

const EventFormContext = createContext<EventFormContextType | undefined>(
  undefined
);

export const EventFormProvider = ({
  children,
  initialEventData,
  initialTicketData,
  initialGuestListData,
}: {
  children: ReactNode;
  initialEventData?: Doc<"events">;
  initialTicketData?: TicketType[] | null;
  initialGuestListData?: Doc<"guestListInfo"> | null;
}) => {
  // Event Details
  const [eventName, setEventName] = useState(initialEventData?.name || "");
  const [description, setDescription] = useState(
    initialEventData?.description || ""
  );
  const [address, setAddress] = useState(initialEventData?.address || "");
  const [startTime, setStartTime] = useState<number | null>(
    initialEventData?.startTime || null
  );
  const [endTime, setEndTime] = useState<number | null>(
    initialEventData?.endTime || null
  );
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | null>(
    initialEventData?.photo || null
  );

  // Guest List
  const [isGuestListSelected, setIsGuestListSelected] =
    useState(!!initialGuestListData);
  const [guestListCloseTime, setGuestListCloseTime] = useState<number | null>(
    initialGuestListData?.guestListCloseTime || null
  );
  const [checkInCloseTime, setCheckInCloseTime] = useState<number | null>(
    initialGuestListData?.checkInCloseTime || null
  );
  const [guestListRules, setGuestListRules] = useState<string>(
    initialGuestListData?.guestListRules || ""
  );

  // Tickets
  const [isTicketsSelected, setIsTicketsSelected] =
    useState(!!initialTicketData);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>(
    initialTicketData?.map((type) => ({
      name: type.name,
      price: type.price.toString(),
      capacity: type.capacity.toString(),
      ticketSalesEndTime: type.ticketSalesEndTime,
      showCustomInput: !ticketNameOptions.includes(type.name),
    })) || []
  );

  // Autocomplete
  const [value, setValue] = useState<AddressValue | null>(null);

  const [errors, setErrors] = useState<EventFormErrors>({});
  const isIOSDevice = isIOS();

  useEffect(() => {
    if (!isTicketsSelected) {
      setTicketTypes([]);
    }
  }, [isTicketsSelected]);

  return (
    <EventFormContext.Provider
      value={{
        eventName,
        setEventName,
        description,
        setDescription,
        address,
        setAddress,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        photoStorageId,
        setPhotoStorageId,
        isGuestListSelected,
        setIsGuestListSelected,
        guestListCloseTime,
        setGuestListCloseTime,
        checkInCloseTime,
        setCheckInCloseTime,
        guestListRules,
        setGuestListRules,
        isTicketsSelected,
        setIsTicketsSelected,
        ticketTypes,
        setTicketTypes,
        value,
        setValue,
        errors,
        setErrors,
        isIOSDevice,
      }}
    >
      {children}
    </EventFormContext.Provider>
  );
};

export const useEventForm = (): EventFormContextType => {
  const context = useContext(EventFormContext);
  if (!context) {
    throw new Error("useEventForm must be used within an EventFormProvider");
  }
  return context;
};
