"use client";

import SearchInput from "@/features/events/components/SearchInput";
import { filterContactsByName } from "@/shared/utils/format";
import { useMemo, useRef, useState } from "react";
import ContactsContent from "./ContactsContent";
import { Doc } from "@/convex/_generated/dataModel";
import { SEARCH_MIN_LENGTH } from "@/shared/types/constants";
import SectionContainer from "@/shared/ui/containers/SectionContainer";

interface ContactsSectionProps {
  contacts: Doc<"contacts">[];
}

const ContactsSection = ({ contacts }: ContactsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = useMemo(() => {
    return filterContactsByName(contacts, searchTerm);
  }, [contacts, searchTerm]);

  const showSearch = contacts.length > SEARCH_MIN_LENGTH;
  return (
    <SectionContainer>
      {showSearch && (
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          placeholder="Search contacts..."
        />
      )}
      <ContactsContent contacts={filteredContacts} />
    </SectionContainer>
  );
};

export default ContactsSection;
