"use client";

import SearchInput from "@/features/events/components/SearchInput";
import SectionContainer from "@/shared/ui/containers/SectionContainer";
import { filterContactsByName } from "@/shared/utils/format";
import { useMemo, useRef, useState } from "react";
import ContactsContent from "./ContactsContent";
import { Doc } from "@/convex/_generated/dataModel";

interface ContactsSectionProps {
  contacts: Doc<"contacts">[];
}

const ContactsSection = ({ contacts }: ContactsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = useMemo(() => {
    return filterContactsByName(contacts, searchTerm);
  }, [contacts, searchTerm]);
  return (
    <SectionContainer>
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputRef={searchInputRef}
        placeholder="Search contacts..."
      />
      {filteredContacts.length > 0 ? (
        <ContactsContent contacts={filteredContacts} />
      ) : (
        <p className="text-grayText">No contacts found.</p>
      )}
    </SectionContainer>
  );
};

export default ContactsSection;
