"use client";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { useState } from "react";
import ContactsQuery from "@/features/contacts/components/ContactsLoader";
import ResponsiveAddContact from "@/features/contacts/components/ResponsiveAddContact";
import { useUserScope } from "@/contexts/UserScope";

const ContactsIdPage = () => {
  const { userId } = useUserScope();
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);

  const handleOpenAddContact = () => {
    setIsAddingContact(true);
  };

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Contacts"
        actions={<AddButton onClick={handleOpenAddContact} label="Contact" />}
      />

      <ContactsQuery userId={userId} />

      <ResponsiveAddContact
        isOpen={isAddingContact}
        onOpenChange={setIsAddingContact}
        userId={userId}
      />
    </PageContainer>
  );
};

export default ContactsIdPage;
