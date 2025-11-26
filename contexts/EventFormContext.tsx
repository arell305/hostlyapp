"use client";

import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useContext,
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

  const [isTicketsSelected, setIsTicketsSelected] = useState(
    !!initialTicketData?.length
  );
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

    setIsTicketsSelected(!!initialTicketData?.length);
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
    if (!isEditing) {
      return (
        eventName.trim() !== "" ||
        description.trim() !== "" ||
        address.trim() !== "" ||
        startTime !== null ||
        endTime !== null ||
        photoStorageId !== null ||
        isGuestListSelected ||
        isTicketsSelected ||
        ticketTypes.length > 0 ||
        guestListRules.trim() !== "" ||
        guestListCloseTime !== null ||
        checkInCloseTime !== null
      );
    }

    if (!initialEventData) return false;

    const eventChanged =
      eventName.trim() !== (initialEventData.name?.trim() || "") ||
      description.trim() !== (initialEventData.description?.trim() || "") ||
      address.trim() !== (initialEventData.address?.trim() || "") ||
      startTime !== initialEventData.startTime ||
      endTime !== initialEventData.endTime ||
      photoStorageId !== initialEventData.photo;

    const guestListChanged =
      isGuestListSelected !== !!initialGuestListData ||
      (isGuestListSelected &&
        (guestListCloseTime !== initialGuestListData?.guestListCloseTime ||
          checkInCloseTime !== initialGuestListData?.checkInCloseTime ||
          guestListRules.trim() !==
            (initialGuestListData?.guestListRules?.trim() || "")));

    const originalActiveTickets =
      initialTicketData?.filter((t) => t.isActive) || [];
    const ticketsChanged =
      isTicketsSelected !== originalActiveTickets.length > 0 ||
      (isTicketsSelected &&
        (ticketTypes.length !== originalActiveTickets.length ||
          ticketTypes.some((t, i) => {
            const orig = originalActiveTickets[i];
            if (!orig) return true;
            return (
              t.name.trim() !== orig.name.trim() ||
              Number(t.price) !== orig.price ||
              Number(t.capacity) !== orig.capacity ||
              t.ticketSalesEndTime !== orig.ticketSalesEndTime ||
              (t.description?.trim() || "") !== (orig.description?.trim() || "")
            );
          })));

    return eventChanged || guestListChanged || ticketsChanged;
  }, [
    isEditing,
    initialEventData,
    initialTicketData,
    initialGuestListData,
    eventName,
    description,
    address,
    startTime,
    endTime,
    photoStorageId,
    isGuestListSelected,
    isTicketsSelected,
    ticketTypes,
    guestListRules,
    guestListCloseTime,
    checkInCloseTime,
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

export const useEventForm = (): EventFormContextType => {
  const context = useContext(EventFormContext);
  if (!context) {
    throw new Error("useEventForm must be used within EventFormProvider");
  }
  return context;
};
