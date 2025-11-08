"use client";

import { Contact } from "lucide-react";
import { useBulkUpsertContacts } from "../../../domain/contacts";
import { useUserScope } from "../../../shared/hooks/contexts";
import { setErrorFromConvexError } from "../../../shared/lib/errorHelper";
import { isValidPhoneNumber } from "../../../shared/utils/frontend-validation";
import { Button } from "../../../shared/ui/primitive/button";

interface ContactInfo {
  name: string[];
  tel: string[];
  email?: string[];
  address?: string[];
  icon?: string[];
}

interface ContactsSelectOptions {
  multiple?: boolean;
}

interface ContactsManager {
  select(
    properties: ("name" | "tel" | "email" | "address" | "icon")[],
    options?: ContactsSelectOptions
  ): Promise<ContactInfo[]>;
  getProperties(): Promise<string[]>;
}

declare global {
  interface Navigator {
    contacts?: ContactsManager;
  }
}

export function ContactPickerButton() {
  const { userId } = useUserScope();

  const { bulkUpsert, error, setError } = useBulkUpsertContacts();

  const handleContactOpen = async () => {
    const contactsApi = navigator.contacts;

    if (!contactsApi) {
      alert(
        "Contact Picker not supported. Enable in Safari → Settings → Advanced → Feature Flags → Contact Picker API."
      );
      return;
    }

    try {
      setError(null);
      const properties: ("name" | "tel")[] = ["name", "tel"];
      const selectedContacts = await contactsApi.select(properties, {
        multiple: true,
      });

      const processedContacts = selectedContacts.map((contact) => ({
        name: contact.name[0]?.trim() ?? "",
        phoneNumber: contact.tel[0]?.trim() ?? "",
      }));

      const validContacts = processedContacts.filter(
        (contact) => contact.name && isValidPhoneNumber(contact.phoneNumber)
      );

      const invalidCount = processedContacts.length - validContacts.length;

      await bulkUpsert({
        userId,
        rows: validContacts,
      });

      if (invalidCount > 0) {
        alert(
          `Warning: ${invalidCount} contact(s) were skipped due to invalid format (missing name or invalid phone number).`
        );
      }

      if (error) {
        alert(error);
      }
    } catch (caughtError: unknown) {
      setErrorFromConvexError(caughtError, setError);
      alert(error);
    }
  };

  return (
    <Button
      variant="menu"
      size="menu"
      onClick={() => {
        handleContactOpen();
      }}
    >
      <Contact size={18} />
      Contacts
    </Button>
  );
}
