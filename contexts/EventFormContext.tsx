"use client";

import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { TicketType, TicketTypeForm, AddressValue } from "@shared/types/types";
import { ticketNameOptions } from "@shared/types/constants";
import { Doc, Id } from "convex/_generated/dataModel";
import { EventFormErrors } from "@/shared/utils/form-validation/validateEventForm";

export interface EventFormContextType {
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

  isGuestListSelected: boolean;
  setIsGuestListSelected: (val: boolean) => void;
  guestListCloseTime: number | null;
  setGuestListCloseTime: (val: number | null) => void;
  checkInCloseTime: number | null;
  setCheckInCloseTime: (val: number | null) => void;
  guestListRules: string;
  setGuestListRules: (val: string) => void;

  isTicketsSelected: boolean;
  setIsTicketsSelected: (val: boolean) => void;
  ticketTypes: TicketTypeForm[];
  setTicketTypes: (val: TicketTypeForm[]) => void;

  value: AddressValue | null;
  setValue: (val: AddressValue | null) => void;

  errors: EventFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<EventFormErrors>>;
  hasChanges: boolean;
  isEditing: boolean;
  setIsEditing?: (val: boolean) => void;
}

export const EventFormContext = createContext<EventFormContextType | undefined>(
  undefined
);

export const EventFormProvider = ({
  children,
  initialEventData,
  initialTicketData,
  initialGuestListData,
  isEditing = false,
  setIsEditing,
}: {
  children: ReactNode;
  initialEventData?: Doc<"events">;
  initialTicketData?: TicketType[] | null;
  initialGuestListData?: Doc<"guestListInfo"> | null;
  isEditing?: boolean;
  setIsEditing?: (val: boolean) => void;
}) => {
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

  const [isTicketsSelected, setIsTicketsSelected] =
    useState(!!initialTicketData);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([]);

  const [value, setValue] = useState<AddressValue | null>(null);
  const [errors, setErrors] = useState<EventFormErrors>({});

  useEffect(() => {
    if (!isEditing) return;

    setEventName(initialEventData?.name || "");
    setDescription(initialEventData?.description || "");
    setAddress(initialEventData?.address || "");
    setStartTime(initialEventData?.startTime || null);
    setEndTime(initialEventData?.endTime || null);
    setPhotoStorageId(initialEventData?.photo || null);

    setIsGuestListSelected(!!initialGuestListData);
    setGuestListCloseTime(initialGuestListData?.guestListCloseTime || null);
    setCheckInCloseTime(initialGuestListData?.checkInCloseTime || null);
    setGuestListRules(initialGuestListData?.guestListRules || "");

    setIsTicketsSelected(!!initialTicketData);
    if (initialTicketData) {
      const activeTickets = initialTicketData.filter((t) => t.isActive);
      setTicketTypes(
        activeTickets.map((t) => ({
          name: t.name,
          price: t.price.toString(),
          capacity: t.capacity.toString(),
          ticketSalesEndTime: t.ticketSalesEndTime,
          showCustomInput: !ticketNameOptions.includes(t.name),
          eventTicketTypeId: t._id,
          description: t.description || "",
        }))
      );
    } else {
      setTicketTypes([]);
    }

    setErrors({});
    setValue(null);
  }, [isEditing, initialEventData, initialTicketData, initialGuestListData]);

  useEffect(() => {
    if (!isTicketsSelected) {
      setTicketTypes([]);
    }
  }, [isTicketsSelected]);

  const hasChanges = useMemo(() => {
    if (!initialEventData) return true;

    const eventChanged =
      eventName.trim() !== (initialEventData.name?.trim() || "") ||
      (description.trim() || "") !==
        (initialEventData.description?.trim() || "") ||
      address.trim() !== (initialEventData.address?.trim() || "") ||
      startTime !== initialEventData.startTime ||
      endTime !== initialEventData.endTime ||
      photoStorageId !== initialEventData.photo;

    const ticketsChanged = (() => {
      const originalActiveTickets =
        initialTicketData?.filter((t) => t.isActive) || [];
      if (isTicketsSelected !== !!initialTicketData?.length) return true;
      if (!isTicketsSelected) return false;
      if (originalActiveTickets.length !== ticketTypes.length) return true;

      return ticketTypes.some((current, i) => {
        const orig = originalActiveTickets[i];
        return (
          current.name.trim() !== orig.name.trim() ||
          Number(current.price) !== orig.price ||
          Number(current.capacity) !== orig.capacity ||
          current.ticketSalesEndTime !== orig.ticketSalesEndTime ||
          (current.description?.trim() || "") !==
            (orig.description?.trim() || "")
        );
      });
    })();

    const guestListChanged = (() => {
      const wasSelected = !!initialGuestListData;
      if (isGuestListSelected !== wasSelected) return true;
      if (!isGuestListSelected) return false;

      return (
        guestListCloseTime !== initialGuestListData?.guestListCloseTime ||
        checkInCloseTime !== initialGuestListData?.checkInCloseTime ||
        guestListRules.trim() !==
          (initialGuestListData?.guestListRules?.trim() || "")
      );
    })();

    return eventChanged || ticketsChanged || guestListChanged;
  }, [
    initialEventData,
    initialTicketData,
    initialGuestListData,
    eventName,
    description,
    address,
    startTime,
    endTime,
    photoStorageId,
    ticketTypes,
    isTicketsSelected,
    isGuestListSelected,
    guestListCloseTime,
    checkInCloseTime,
    guestListRules,
  ]);

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
        hasChanges,
        isEditing,
        setIsEditing,
      }}
    >
      {children}
    </EventFormContext.Provider>
  );
};
