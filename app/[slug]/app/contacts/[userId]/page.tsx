"use client";
import { AddButton } from "@/components/shared/buttonContainers/NewItemButton";
import PageContainer from "@/components/shared/containers/PageContainer";
import SectionHeaderWithAction from "@/components/shared/headings/SectionHeaderWithAction";
import React, { useState } from "react";
import ContactsQuery from "./ContactsQuery";
import ResponsiveAddContact from "../../components/responsive/ResponsiveAddContact";
import { useUserScope } from "@/contexts/UserScope";

const ContactClientPage = () => {
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

export default ContactClientPage;
